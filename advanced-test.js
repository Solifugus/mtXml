
const OrdXml = require('./ordxml.js').OrdXml;
let ordxml = new OrdXml({ definitions:true });

let xmlData = '<say message="Hello World!"/>'; //\n<mystuff whos="mine" not="yours"> <item>coffee</item><item>phone</item> </mystuff>';
let data = ordxml.parse(xmlData)
//console.log( JSON.stringify( data, null, '  ' ) );

let xmlDef = '<say{ console.log( tag.attrib.message ); }/>';
let defs = ordxml.parse(xmlDef);
defs.elems[0].def( data.elems[0] );


