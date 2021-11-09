const fs = require('fs')
const ordxml = require('./ordxml.js').ordxml;
//const ordxml = require('ordxml').ordxml;

let xml = fs.readFileSync('./test.xml').toString();

//console.log( 'XML: ' + JSON.stringify(xml) );
console.log( 'PARSED: ' + JSON.stringify( ordxml.parseDoc(xml), null, '  ') );

