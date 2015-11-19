# Hiff - the diff that understands HTML

Hiff is a small module that can take two pieces of HTML, compare them against each other, and return a complete list of differences between the two - ignoring things like attribute order or insignificant whitespace that don't influence semantics. Basically, if it would render the same in a browser, it'll compare as equal.

Uses [cheerio][cheerio] under the hood for HTML parsing.

## Quick start

```javascript
var hiff = require('hiff');

var result = hiff.compare('<div>Some HTML</div>', '<div>Possibly changed HTML</div>');
if (result.different) {
  console.log("HTML fragments are different, changes:");
  result.changes.map(function(change) {
    console.log("In " + change.path + ":\n\t" + change.message);
  });
} else {
  console.log("No changes found.");
}
```

## Why is it better than textual diff?

It produces better results on HTML than the standard text-based diff because it understands the structure better. It produces far less false positives, and more relevant information about changes when it detects them.

## Actual documentation

### compare(oldHTMLString, newHTMLString, [options])

Compares `oldHTMLString` to `newHTMLString` and returns an object of the following shape:

```
{
  different: <boolean> 
  changes: [<change>, <change>, ...] // for details on change objects, see below

  // the HTML strings that were used for the comparison
  before: "<html>...old..." 
  after: "<html>...new...,

  // Cheerio objects for the before and after state - all nodes used in change objects
  // will come from these two DOM trees
  $before: ...,
  $after: ...
}
```

The `options` argument is not required, but it allows you to influence how the comparison is performed. Options should be passed as an object with one or more of the following keys:

* **ignoreComments** (default: true) - if true, comments will be stripped from both pieces of HTML before looking for changes, effectively ignoring them completely.
* **ignore** (default: []) - a list of JQuery selectors for nodes that you want to ignore when comparing, e.g. `['.ad', 'div[ignore="true"]']`. All changes to the attributes or contents of nodes matching the selectors will be ignored.
* **ignoreText** (default: []) - a list of selectors for nodes whose text content you want to ignore. This will only ignore changes to existing text - structural changes like adding a new text node where there wasn't any will still be reported. You can also set this option to `true` to ignore content of *all* text nodes.

### Change objects

Change objects provide the following properties:

* **type** - `added`, `removed` or `changed` - depending on what type of change was detected.
* **in** - the Cheerio node in which the change was detected
* **path** - a CSS-like path for the node in which the change was detected, e.g. 'div#navigation > a.nav'
* **message** - a printable message describing the change (colorized for use on XTerm-compatible terminals, with green for additions and red for removals)

For `added` and `removed` only:

* **node** - the Cheerio node that was added/removed

For `changed` only:

* **oldNode** - the Cheerio node as it looked in the old HTML
* **newNode** - the Cheerio node as it looked in the new HTML



[cheerio]: https://github.com/cheeriojs/cheerio
