# ordxml

ordxml is a class to parse XML or XML-like syntax into JavaScript objects.
Unlike other XML Parsers in the npm ecosystem, ordxml maintains the order of elements (tags and text).

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
const xmlparser = new require('OrdXml')();

let xml = '<hello name="George">I am George</hello>';
let parsed = xmlparser.parse(xml);
console.log( JSON.stringify( parsed, null, '  ' ) );
```

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

