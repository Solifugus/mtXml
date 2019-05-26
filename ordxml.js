

String.prototype.hasNext = function ( seeking, pos = 0 ) {
	let has = false;
	for( let i = 0; i < seeking.length; i += 1 ) {
		if( this.substr( pos, seeking[i].length ) === seeking[i] ) {
			has = true;
			break;
		}
	}
	return has;
}

String.prototype.getNext = function ( seeking, pos = 0 ) {
	let found = undefined;
	for( let i = 0; i < seeking.length; i += 1 ) {
		if( this.substr( pos, seeking[i].length ) === seeking[i] ) {
			found = seeking[i];
			break;
		}
	}
	return found;
}

// First first position in string not of seeking string character (if string else string if array)
String.prototype.firstFound = function ( seeking, pos = 0 ) {
	while( pos < this.length ) {
		if( this.hasNext( seeking, pos ) ) break;
		pos += 1;
	}
	if( pos >= this.length ) pos = -1;
	return pos;
};

// First first position in string not of seeking string character (if string else string if array)
String.prototype.firstNotFound = function ( seeking, pos = 0 ) {
	while( pos < this.length ) {
		if( !this.hasNext( seeking, pos ) ) break;
		pos += 1;
	}
	if( pos >= this.length ) pos = -1;
	return pos;
};


// ==========<< OrdXml Class Definition >>========== //
class OrdXml {
	constructor( setup = {} ) {
		// TODO: add params
		//    forgiving: true = let anything go unless critical
		setup.trim      = ( setup.trim      !== undefined ) ? setup.trim : true;       // remove heading/trailing whitespace from text within tags
		setup.caseless  = ( setup.caseless  !== undefined ) ? setup.caseless : true;   // tags interpreted as caseless (all made same case)
		setup.forgiving = ( setup.forgiving !== undefined ) ? setup.forgiving : true;  // let anything go, if reasonably possible
		setup.flattags  = ( setup.flattags  !== undefined ) ? setup.flattags : false;  // true = no hierarchy; false = hierarchy; array = hierachy except specified tag names
		this.setup = setup;

		console.log( 'SETUP: ', JSON.stringify( setup, null, '  ' ) );
	}

	parse( xml, tag = { name:'', attrib:{}, elems:[] } ) {
		xml = ( typeof xml === 'string' ) ? { raw:xml, pos:0 } : xml;
		
		while( xml.pos < xml.raw.length ) {
			// Find Next "<" and ">" 
			let nextLeft = xml.raw.indexOf( '<', xml.pos);
			let nextRight = xml.raw.indexOf( '>', nextLeft+1 );
			if( nextRight === -1 ) {  // If no ">", error out..
				console.error( 'Missing closing ">" after ' + placeInCode( xml.raw, xml.pos ) );
				xml.pos = xml.raw.length;
				return undefined;
			}

			// Store any text before "<"
			let text;
			if( nextLeft > xml.pos ) {
				if( this.setup.trim ) { text = xml.raw.substring( xml.pos, nextLeft ).trim(); }
				else { text = xml.raw.substring( xml.pos, nextLeft ); }
				if( text.length > 0 ) tag.elems.push( text ); 
			}

			// If no "<" then store all remaining text and return
			if( nextLeft === -1 ) {
				if( xml.pos < xml.length-1 ) {
					//tag.elems.push( this.trim(xml.raw.substr( xml.pos )) );
					if( this.setup.trim ) { text = xml.raw.substr( xml.pos ).trim(); }
					else { text = xml.raw.substr( xml.pos ); }
					if( text.length > 0 ) tag.elems.push( text ); 
				}
				xml.pos = xml.raw.length;
				return tag;
			}

			// Get Tag Name (including any preceeding '/')
			let name = xml.raw.substr(nextLeft+1).match(/^[^\s<>]*/)[0].trim();  // Ultra-Forgiving Tag Identification
			let attribsBegin = nextLeft + name.length + 1;
			let attribsEnd   = xml.raw.firstFound( ['/','>'], attribsBegin );

			let closingSuper = false;
			let newTag       = tag;  // default, if it is merely closing the super (so we can collect attribs added to closing of super)
			if( name[0] === '/' && name.substr(1).toLowerCase() === tag.name ) { closingSuper = true; }
			else { newTag = { name:name, attrib:{}, elems:[] }; }

			// Grab Assigned Attributes
			console.log('ATTRIBS: [' + xml.raw.substring( attribsBegin, attribsEnd ) + ']');
			let attribs = xml.raw.substring( attribsBegin, attribsEnd ).match(/[^\s]+\s*=\s*[^\s]*/gm);
			if( attribs !== null ) {
				for( let i = 0; i < attribs.length; i += 1 ) {
					let halves = attribs[i].split('=');
					let name;
					let value = halves[1].trim();
					if( value.length > 1 && value[0] === '"' && value[value.length-1] === '"' ) { value = value.substring(1,value.length-1); }
					else { if( !isNaN( value ) ) value = Number( value ); }
					if( this.setup.caseless ) { name = halves[0].trim().toLowerCase(); }
					else { name = halves[0].trim(); }
					//if( newTag.attrib[attribName] === undefined ) { newTag.attrib[attribName] = halves[1].trim(); }
					switch( typeof newTag.attrib[name] ) {
						case 'undefined': newTag.attrib[name] = value; break;
						case 'string':
						case 'number': newTag.attrib[name] = [ newTag.attrib[name], value ]; break;
						case 'object': newTag.attrib[name].push(value); break;
						default: console.error('ERROR: Unexpected attribute value type');
					}
				}
			}


			// Grab Boolean Attributes
			
			// Got Tag so Set Pos Past it..
			xml.pos = nextRight + 1;
			
			// If end of recurse into tag, return (since any attribs added to closing tag are collected now)
			if( closingSuper ) { return tag; }  // newTag is old tag (just closing it)
			
			// Is Self-Closing Tag?
			if( xml.raw[nextRight-1] === '/' ) {
				tag.elems.push( newTag );
			}
			else {
				tag.elems.push( this.parse( xml, newTag ) );
			}
			
		} // end of while( pos < xml.length )

	}  // end of parse() method

} // end of Ordxml class

exports.OrdXml = OrdXml;


