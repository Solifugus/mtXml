const fs = require('fs')
//const ordxml = require('./ordxml.js').ordxml;
const ordxml = require('ordxml').ordxml;

// Read the XML Text From File Into a Variable
let xml = fs.readFileSync('./test-advanced.xml').toString();

// Parse the XML Text into a Comprehensive Object
let doc = ordxml.parseDoc( xml );

// Create a Simplified Data Tree Object (By Specified ID's)
let data = ordxml.buildIdTree( doc );

// Collect Data From Deep Tag Properties, Exmaples
handle = data.myapp.profile.username.prop.value;
email  = data.myapp.profile.email.prop.value
console.log('Handle: ', handle);
console.log('Email: ', email);

// Free Text Are Put Into "text"+n Elements with a "value" property
about = data.myapp.about.text0.prop.value;
console.log('About Text: ', about);

