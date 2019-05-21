# ordxml
XML Parser that maintains the order of elements and is otherwise very forgiving.

This parser is not XML validating and does not care about strict compliance to the XML standard.  
Instead, ordxml is focused on practicality.  

The focus is on get work done with no unnecessary obstacles.  
If malformed XML is understandable then we keep moving.

## Assumptions toward that end

* If an attribute has no value, we assume its existence means the value is "true".
* Free floating within tags are assumed to be within <text> .. </text> tags.
* Tags that open and close intermixed with others is also allowed, even though not stricturely heirarchical.

The order of tags are maintained, including the assumed <text> tag elements.
This is necessary for HTML, for example, as you have text elements ordered in mix with links, inputs, etc.

A tag that opens in one tag and closes wthin another is auto-closed at the end of the first and auto-started at the beginning of the next (until closed).
This can simplify markup, such as the way old 1980's document markup often worked.  Tags were not necessarily heirarchical but merely indicated where a state began and where that state ended -- if indeed it was meant to end at all.
Hierarchies are often useful but also very unnecessarily constraining.  Consider this text:  a <b> dog I <i>used to walk</b> liked to liked my legs</i>.  
These tags are merely turning on and off styles.  They are not a heirarchy.  Forcing them to be heirarchical is just being controlling and tyrannical.



