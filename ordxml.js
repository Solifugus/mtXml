
var mtlib = require('./mtlib.js').mtlib;

// ======================================================================
// Object Definition: "ordxml"
var ordxml = {
	parseDoc:function(xml){
		console.log('parsing '+xml.length+': ' + xml);
		let contents = this.parseContents( xml )
		return contents.contents;
	}, // end of parseDoc()

	parseContents:function( xml, from=0, inTag='' ) {
		let contentsBegan = from;
		let contents      = [];
		let foundTagEnd   = false;
		do {
			// Look for End of Tag (currently within else error) or Start of Next Tag 
			next = mtlib.firstFound(xml,['<!--','<![CDATA[','</'+inTag,'</','<'],from)

			// None Found and NOT IN a Tag
			if( next === false && inTag === '' ) {
				foundTagEnd = true;  // actually document end
				let postext = xml.slice(from);
				if( postext.trim() !== '' ) contents.push( postext );
				from = xml.length
			}

			// None Found and IS IN a Tag
			if( next === false && inTag !== '' ) {
				console.error('ERROR at '+contentsBegan+': Tag "' + inTag +'" not terminated.');
				process.exit(1);
			}

			// If End of Current Tag
			if( next.found === '</'+inTag ) {
				postText = xml.slice(from,next.at-1);
				if( postText.trim() !== '' ) contents.push( postText );
				foundTagEnd = true;
				from = next.at + ('</'+inTag).length;  // TODO: might be other stuff before '>'
			}

			// If Unexpected End Tag (any ending other than '</'+inTag)
			if( next.found === '</' ) {
				console.error('ERROR at '+from+': End Tag Not Matched to Start of Tag "'+inTag+'".');
				process.exit(1);
			}

			// IF Start of New Tag
			if( next.found === '<' ) {
				let pretext = xml.slice(from,next.at-1);
				if( pretext.trim() !== '' ) contents.push( pretext );	
				let parsed = this.parseTag(xml,next.at);
				from = parsed.nextAt;  // ZZZ
				contents.push( parsed.tag ); 
			}

			// If Comment
			if( next.found === '<!--' ) {
				pretext = xml.slice(from,next.at-1);
				if( pretext.trim() !== '' ) contents.push( pretext );	
				let endCmt = xml.indexOf('-->',next.at);
				if( endCmt !== -1 ) {
					// Not Pushing Comment
					from = endCmt+3;
				}
				else {
					console.error('WARNIG at '+next.at+': Comment started but never ended.');
					from = xml.length;
				}
			}

			// If CDATA
			if( next.found === '<![CDATA[' ) {
				pretext = xml.slice(from,next.at-1);
				if( pretext.trim() !== '' ) contents.push( pretext );	
				let endCmt = xml.indexOf(']]>',next.at);
				if( endCmt !== -1 ) {
					contents.push( xml.slice(next.at+8,endCmt) );  // pushing cdata block
					from = endCmt+3;
				}
				else {
					console.error('WARNIG at '+next.at+': CDATA started but never ended.');
					from = xml.length;
				}
			}

		} while( from <= xml.length && !foundTagEnd );
		return { contents:contents, nextAt:from };

	},

	// Parse Whole Tag (Start, Params, Contents, End)
	parseTag:function( xml, tagFirst ){
		let stringEnclosure={openner:'"',closer:'"',escaper:'\\'} 
		let tag = { type:undefined, id:undefined, prop:{}, contents:[] }
		let attribFirst;
		let attribLast;
		let contentFirst = null;  // if ending in />, there is no content
		let afterEndTag;
		// Get Tag Type and Start of Tag Attirbutes Section
		let m = xml.slice(tagFirst).match( /\s*([a-z]+[a-z0-9]*)/i ); 
		if( m === null ) {
			console.error('ERROR at '+tagFirst+': Malformed tag identifier.');
			process.exit(1);
		}
		else {
			tag.type = m[0]; // Type of Tag
			attribFirst = tagFirst+tag.type.length;
		}

		// Identify End of Tag Attributes Section 
		let th = xml.slice(attribFirst);
		let p = attribFirst;
		attribEnd = mtlib.firstFound(xml,['>','/>'],attribFirst,stringEnclosure);
		if( attribEnd === false ) {
			console.error('ERROR at '+attribFirst+': Could not find end of tag attributes section.' + attribFirst);
			process.exit(1);
		}
		else {
			// Identified last of attributes & first of content, if any ('/>' endings have no content)
			attribLast = attribEnd.at - 1;
			if( attribEnd.found === '>' ) contentFirst = attribEnd.at;
		}

		// Capture Tag Attributes
		attribSection = xml.slice(attribFirst,attribLast);
		let param = this.parseParams( xml, attribFirst, attribLast ); // XXX
		tag.id    = param.id;
		tag.prop = param.prop;

		// Capture Tag Contents, Recursively..
		if( contentFirst !== null ) {
			let found    = this.parseContents(xml,contentFirst,tag.type);
			tag.contents = found.contents;
			afterEndTag  = found.nextAt;
		}
		// Unless No Contents Expected (ending in />)
		else { 
			tag.contents = undefined;
			afterEndTag  = attribLast+2;
		}
		return {tag:tag,nextAt:afterEndTag};
	},  // end of parseTag

	// Parse XML Parameters
	parseParams( str, from, thru = str.length ) {
		let param = { id:'', prop:{} };

		// Has Instance ID? (<tagtype instanceID: assignments/>)
		let nameFound = mtlib.captureAhead( str, from, mtlib.letters+mtlib.digits, mtlib.whitespace );
		let operFound = mtlib.captureAhead( str, nameFound.nextAt, ':', mtlib.whitespace );
		if( operFound.captured === ':' ) {
				param.id = nameFound.captured;
				from     = operFound.nextAt;
		}

		// Read All Assignments
		while( from <= thru ) {
			nameFound = mtlib.captureAhead( str, from, mtlib.letters+mtlib.digits, mtlib.whitespace );
			if( nameFound.captured === '' ) {
				break;  // TODO: check for /> or >, up next maybe?
				console.error('ERROR: expected property name not found, at ' + from +'.');
				return null;
			}
			operFound = mtlib.captureAhead( str, nameFound.nextAt, '=', mtlib.whitespace );

			// If No "=" Sign Then Assign True--it's a flag
			if( operFound.captured === '' ) {
				param.prop[nameFound.captured] = true;
				from = nameFound.nextAt;
				continue;
			}
	
			// Gather Assigned Value(s)	
			let name  = nameFound.captured;
			from = operFound.nextAt;
			do {
				gotValue = false;
				let value;

				// Is String?
				if( !gotValue ) {
					let found = mtlib.captureAhead( str, from, '"', mtlib.whitespace );
					if( found.captured === '"' ) {
						let strFirst = found.nextAt;
						let valueFound = mtlib.captureUntil( str, strFirst, until = '"' );
						//param.prop[nameFound.captured] = valueFound.captured;
						value = valueFound.captured;
						from = valueFound.nextAt;
						gotValue = true;
					}
				}

				// Is Number?
				if( !gotValue ) {
					valueFound = mtlib.captureAhead( str, from, '-0123456789.', mtlib.whitespace );
					if( valueFound.captured !== '' ) {
						if( !isNaN( valueFound.captured ) ) {
							//param.prop[nameFound.captured] = Number(valueFound.captured);
							value = Number(valueFound.captured);
						}
						else {
							console.error('ERROR: Malformed number "'+valueFound.captured+'" assign to "'+nameFound.captured+'" at '+from+'.');
							return null;
						}
						from = valueFound.nextAt;
						gotValue = true;
					}
				}

				// Is Boolean? (True/False or Yes/No)
				if( !gotValue ) {
					valueFound = mtlib.captureWord( str, from, ['True','False','Yes','No'], this.whitespace );
					if( valueFound.captured !== '' ) {
						if( valueFound.captured === 'True' || valueFound.captured === 'Yes' ) value = true;
						if( valueFound.captured === 'False' || valueFound.captured === 'No' ) value = false;
						from = valueFound.nextAt;
						gotValue = true;
					}
				}

				// Is Condition?
				// TODO: ( .. )

				// Is Time?
				// TODO: \ .. \
	
				// Make Assignment; If Multiple Values, Make Array as Necessary..
				if( param.prop[name] === undefined ) { param.prop[name] = value; }
				else { 
					if( !Array.isArray(param.prop[name]) ) param.prop[name] = [param.prop[name]];
				}
				if( Array.isArray(param.prop[name]) ) param.prop[name].push(value)

				// Comma Separated Array of Values?
				found = mtlib.captureAhead( str, from, ',', mtlib.whitespace );
				if( found.captured === ',' ) {
					from = found.nextAt;
				}
				else { break; }

			} while( true );

		} // end of while( from <= thru )
		return param;
	}  // end of parseParamS(..)

} // end of ordxml

exports.ordxml = ordxml;
