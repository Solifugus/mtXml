
// ====================<< mtlib >>======================== //
var mtlib = {
	letters:'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ',
	digits:'0123456789',  
	whitespace:' \t\n',
};

// Find First Among One+ Alternative Strings Ahead
mtlib.firstFound = function( str, soughts, from=0, enclosure=undefined ) {
	if( !Array.isArray(soughts) ) soughts = [soughts];
	let found       = false;
	let inEnclosure = false;
	do {
		// Enclosure?
		if( enclosure !== undefined ) {
			if( !inEnclosure ) {
				if( str[from] === enclosure.openner ) inEnclosure = true;
			} 
			else {
				if( str[from-1] != enclosure.escaper && str[from] === enclosure.closer ) inEnclosure = false; 
			}
		}
		
		// Seek the Soughts, in Order
		if( !inEnclosure ) {
			for( s in soughts ) {
				sought = soughts[s];
				if( str.slice(from,from+sought.length) === sought ) {
					found = sought; 
					break;
				}
			} // end of: for( s in soughts )
		} // end of: !inEnclosure
		from += 1;
	} while( found === false && from <= str.length );
	if( !found ) { return found; } else { return { found:found, at:from } }
}

// Capture Certain Characters Ahead
mtlib.captureAhead = function( str, from = 0, capchars, delchars=' \t' ) {
	let s        = 0;
	let captured = '';
	do {
		c = str[from];

		// Delimiter Character(s) Found?
		if( delchars.indexOf(c) !== -1 ) {
			from += 1;
			if( captured != '' ) break;  // Delimited
			continue; // hasn't yet found anything to delimit
		}

		// Capture Character(s) Found?
		if( capchars.indexOf(c) === -1 ) break;
		captured += c;
		from     += 1;
	} while( from <= str.length ); 
	return { captured:captured, nextAt:from }
}

// Capture All Characters Ahead Until (and not including)
mtlib.captureUntil = function( str, from = 0, until = '\n' ) {
	let captured = '';
	while( from <= str.length ) {
		if( str[from] === until ) {
				from += 1;
				break;
		}
		captured += str[from];
		from     += 1;
	}
	return {captured:captured,nextAt:from};
}

// Capture Any of Supplied Words (caseless find; caseful return)
mtlib.captureWord = function( str, from = 0, words, whitespace = ' \t' ) {
	while( from <= str.length && this.whitespace.indexOf(str[from]) !== -1 ) from += 1;
	let word = '';
	for( let w = 0; w < words.length; w += 1 ) {
		if( str.slice(from,from+words[w].length).toLowerCase() === words[w].toLowerCase() ) {
			word = words[w];
			break;
		}
	}
	return {captured:word,nextAt:from+word.length}
}

// Collect Apskel XML Header Parameters
mtlib.collectParams = function( str, from, thru = str.length ) {
	let param = { id:'', prop:{} };

	// Has Instance ID? (<tagtype instanceID: assignments/>)
	let nameFound = this.captureAhead( str, from, this.letters+this.digits, this.whitespace );
	let operFound = this.captureAhead( str, nameFound.nextAt, ':', this.whitespace );
	if( operFound.captured === ':' ) {
			param.id = nameFound.captured;
			from     = operFound.nextAt;
	}

	// Read All Assignments
	while( from <= thru ) {
		nameFound = this.captureAhead( str, from, this.letters+this.digits, this.whitespace );
		if( nameFound.captured === '' ) {
			break;  // TODO: check for /> or >, up next maybe?
			console.error('ERROR: expected property name not found, at ' + from +'.');
			return null;
		}
		operFound = this.captureAhead( str, nameFound.nextAt, '=', this.whitespace );

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
				let found = this.captureAhead( str, from, '"', this.whitespace );
				if( found.captured === '"' ) {
					let strFirst = found.nextAt;
					let valueFound = this.captureUntil( str, strFirst, until = '"' );
					//param.prop[nameFound.captured] = valueFound.captured;
					value = valueFound.captured;
					from = valueFound.nextAt;
					gotValue = true;
				}
			}

			// Is Number?
			if( !gotValue ) {
				valueFound = this.captureAhead( str, from, '-0123456789.', this.whitespace );
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
				valueFound = this.captureWord( str, from, ['True','False','Yes','No'], this.whitespace );
				if( valueFound.captured !== '' ) {
					//if( valueFound.captured === 'True' || valueFound.captured === 'Yes' ) param.prop[nameFound.captured] = true;
					//if( valueFound.captured === 'False' || valueFound.captured === 'No' ) param.prop[nameFound.captured] = false;
					if( valueFound.captured === 'True' || valueFound.captured === 'Yes' ) value = true;
					if( valueFound.captured === 'False' || valueFound.captured === 'No' ) value = false;
					from = valueFound.nextAt;
					gotValue = true;
				}
			}

			// Is Time?
			// TODO

			// Make Assignment; If Multiple Values, Make Array as Necessary..
			if( param.prop[name] === undefined ) { param.prop[name] = value; }
			else { 
				if( !Array.isArray(param.prop[name]) ) param.prop[name] = [param.prop[name]];
			}
			if( Array.isArray(param.prop[name]) ) param.prop[name].push(value)

			// Comma Separated Array of Values?
			found = this.captureAhead( str, from, ',', this.whitespace );
			if( found.captured === ',' ) {
				from = found.nextAt;
			}
			else { break; }

		} while( true );

	} // end of while( from <= thru )
	return param;
}

exports.mtlib = mtlib;
