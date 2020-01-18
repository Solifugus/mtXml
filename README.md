# ordxml

ordxml is a class to parse XML or XML-like syntax into JavaScript objects.
Unlike other XML Parsers in the npm ecosystem, ordxml maintains the order of elements (tags and text).
Also, ordxml has the optional capability of defining the functionality of tag types using JavaScript code.

Beyond this, ordxml is designed first for maximum flexibility and forgivness.
By default, ordxml will allow any visible characters as tag or attribute names and does not car about quotes around values assigned.
Ordxml will break only if it absolutely must.
The purpose of this is to enable the creation of XML-like markup notations with maximum possible flexibility, including support for malformed code.

That said -- ordxml is very new and I would like to add support for strict XML validation, etc.
And in-so-doing, I would like to be very informative to assist users in correcting malformed XML. 
These things are in the Roap Map.  
These are actually easy things to add but I tend to add features when I have a particular need, or impetus, or boredom to do so.

## Installation

```bash
npm install ordxml
```

## Usage Example 
```javascript
# Load and Instantiate
const OrdXml = require('ordxml').OrdXml;
let ordxml = new OrdXml({ definitions:true });

# Parse and show some data in XML
let xmlData = '<say message="Hello World!"/>\n<mystuff whos="mine" not="yours"> <item>coffee</item><item>phone</item> </mystuff>';
let data = ordxml.parse(xmlData)
console.log( JSON.stringify( data, null, '  ' ) );

# Parse and execute a tag definition on the data previously parsed
let xmlDef = '<say{ console.log( tag.attrib.message ); }/>';
let defs = ordxml.parse(xmlDef);
defs.elems[0].def( data.elems[0] );

```

The above illustrates first just how data, including tags and text are parsed into an object.
The top level in the parsed object is always a tag named with an empty string.  
That is root and it is needed because you might have multiple top-level tags defined.

The second part illustresa defining the "say" tag type with javascript code.  
That code is converted into a function (def) to which is passed the parameter (tag).
Therefore, inside the <say{ .. }/> code is passed an object named "tag" which is actually the data xml parsed in earlier,
<say message="Hellow World!"/>.


## Forgiveness 

* Tag and attribute names may comprise of any visible character (not including whitespace).
* attribute names given without "=" sign will interpret as assigned to boolean true.
* Attributes may be assigned either in the openning or closing tag.
* An out of place closing tag will register but not break.
* Unclosed tags will not break.

## Roap Map

* Config option for strict XML
* Add CDATA support..
* Config option for making ordxml a drop-in replacement for "fast-xml-parser"
* config option for making ordxml a drop-in replacement for "xml2js"
* Config option to parse elements in either: hierarchy (default), serial array, or hierarchy with specific tags excepted

## Bugs

* I am sure there will be some, soon enough.

