const fs = require('fs')
const OrdXml = require('./ordxml.js').OrdXml;
let ordxml = new OrdXml({  });

let xml = fs.readFileSync('./test1.xml').toString();

console.log( 'XML: ' + JSON.stringify(xml) );
console.log( 'PARSED: ' + JSON.stringify( ordxml.parse(xml), null, '  ') );

