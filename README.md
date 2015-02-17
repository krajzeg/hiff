# Hiff - the diff that understands HTML

Hiff is a small module that can take two pieces of HTML, compares them against each other, and return a complete list of differences between the two - ignoring things like attribute order or insignificant whitespace that don't influence semantics.

## Quick start

```javascript
var hiff = require('hiff');

var changes = hiff.diff('<div>Some HTML</div>', '<div>Possibly changed HTML</div>');
if (changes) {
  console.log("HTML fragments are different, changes:");
  changes.map(function(change) {
    console.log("In " + change.path + ":\n\t" + change.message);
  });
} else {
  console.log("No changes found.");
}
```

## Why is it better than textual diff?

It produces better results on HTML than the standard text-based diff because it understands the structure better. It produces far less false positives, and more relevant information about changes when it detects them.

## Actual documentation

### diff(oldHTMLString, newHTMLString, [options])

Compares `oldHTMLString` to `newHTMLString` and returns:

* a list of change objects (see below for details on them) if there are some changes found
* `false` if there are no changes

The `options` argument is optional and allows you to influence how the comparison is performed. Options should be passed as an object with one or more of the following keys:

* **ignoreComments** (default: true) - if true, comments will be stripped from both pieces of HTML before looking for changes, effectively ignoring them completely.
* **ignore** (default: []) - a list of JQuery selectors for nodes that you want to ignore when comparing, e.g. `['.ad', 'div[ignore="true"]']`. All changes to the attributes or contents of nodes matching the selectors will be ignored.

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
