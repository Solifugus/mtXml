
const OrdXml = require('./ordxml.js').OrdXml;
let ordxml = new OrdXml({  });

//xml = 'before<outer one="1" two="2">inside</outer>after';
let xml = '<outer one="1" two="2" three four="a b c d" five=five six=006>inside</outer>after';
/*
let xml = '<application>\n'
	+ '\t<dropdown>\n'
	+ '\t\t<option value="001">One</option>\n'
	+ '\t\t<option value="002">two</option>\n'
	+ '\t\t<option value="003" value=003 value=00x3>three</option>\n'
	+ '\t</dropdown>\n'
	+ '</application>\n'
	;
*/
console.log( 'XML: ' + JSON.stringify(xml) );
console.log( 'PARSED: ' + JSON.stringify( ordxml.parse(xml), null, '  ') );

