# ordxml

## Plan

I have long been thinking about rebranding most of the tools I have published.  The reason is that it's frustrating come up with names not yet taken and it'd be nice to keep them all in one family.  Also, there are some areas in which I'd like to break backward compatibity.  I don't like breaking backward compatibility but I think it's ok if I am rebranding and leaving the old code as it is.  The branding plan is to use the most generic and intuitive names possible but prefixing these with my initials, "mt".

Accordingly, ordxml will become mtXml 1.0.0 and from that point on, I plan to never break backward compatibility.  However first, I want to feature complete ordxml.  I want to finish re-implementing tag definitions.  For example:
```xml
<card{ ..javascript to render card..}/>
<card mycard: title="My Card"> text within card </card>
```
So in the above, the first associates a javascript function to all tags of type "card".  The second line is an example of a card that would have its information sent into the javascript faction to return replacement text for it.  In the above, the function would thus render the card to HTML/CSS.  Of course, this could be used in any number of other ways, too.  One could use the function to process the data in some way.

## Description

Originally, I developed OrdXML because I couldn't find an XML parser for Node.js that kept text and tags in order.
That is, after parsing an XML document, the text contained in a tag and the sub-tags contained were each put in different arrays.
This might have been ok for just parsing data but I wanted to develop a framework for application development.

OrdXML will parse XML data but also has extended capabilities, if you want to use them. 
For example, OrdXML will accept different data types assigned in tag headers:

```xml
<mytag name="Joe" age=42 married=yes employee/>
```
The above tag will translate each assignment to its appropriate JavaScript data type.
An unquoted value of "yes" or "no" becomes JavaScript boolean; the same for "true" or "false".
And notice the "employee" flag at the end.  This is assigned a JavaScript value of True else undefined if not present (naturally). 

OrdXML also supports arrayed assignments in two different ways and of mixed types:

```xml
<mytag foods="apples","pancakes","sandwhiches" foods="bananas" extradata="whatever",42,no/>
```
The above assigns an array of 3 strings to foods, then adds another (bananas) to the same array.
Extradata is also assigned an array but of string, number, and boolean values.

Finally, a tag in OrdXML can have an ID that is not a property, as shown below:

```xml
<mytag myid: propa="hello" propb="goodbye"/>
```
In the above "mytag" is the type of tag while "myid" is meant to uniquely identify the tag, at its hierarchical level in the XML document.
This is my own philosophical addition to XML.  A tag type is essentially a class while its ID uniquely identifies the instance of that class.
Unlike a property named "id" in HTML (for example), this ID is not a property.  It should be unique not throughout the document but at its level within the document.
This way, a reference to data may be made through period notation, such as:

```xml
<app myapp: version="1.0.1">
	<dialog profile: name="Joe" age=52>
	</dialog>
</app>
```

So you might reference the user's name and age like:

```javascript
console.log( myapp.profile.prop.name );
console.log( myapp.profile.prop.age );
```

## Installation

```bash
npm install ordxml
```

## Usage Example 
```javascript
# Load and Instantiate
const ordxml = require('ordxml').ordxml;

# Parse and show some data in XML
let xmlData = '<say message="Hello World!"/>\n<mystuff whos="mine" not="yours"> <item>coffee</item><item>phone</item> </mystuff>';
let data = ordxml.parseDoc(xmlData)
console.log( JSON.stringify( data, null, '  ' ) );
```

## Roap Map

* Config option for making ordxml a drop-in replacement for "fast-xml-parser"
* Config option for making ordxml a drop-in replacement for "xml2js"
* Add back tag function definer syntax in older version, e.g. `<mytag{ javascript code }/>`.
* Add condition data type, e.g. `<mytag cond=( ..logic .. )/>`
* Add time data type, e.g. `<mytag time=\2021-07-29 17:50:28\/>`

## Bugs

* It has been rewritten so bugs will come, I am sure.


