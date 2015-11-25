# Hiff - the diff that understands HTML

[![Build Status](https://travis-ci.org/krajzeg/hiff.svg?branch=next)](https://travis-ci.org/krajzeg/hiff) [![Coverage Status](https://coveralls.io/repos/krajzeg/hiff/badge.svg?branch=next&service=github)](https://coveralls.io/github/krajzeg/hiff?branch=next) [![Dependency Status](https://david-dm.org/krajzeg/hiff.svg)](https://david-dm.org/krajzeg/hiff)

Hiff is a small module that can take two pieces of HTML, compare them against each other, and return a complete list of differences between the two - ignoring things like attribute order or insignificant whitespace that don't influence semantics. Basically, if it would render the same in a browser, it'll compare as equal.

Uses [cheerio][cheerio] under the hood for HTML parsing.

## Quick start

```javascript
var hiff = require('hiff');

var result = hiff.compare('<div>Some HTML</div>', '<div>Possibly changed HTML</div>');
if (result.different) {
  console.log("HTML fragments are different, changes:");
  result.changes.map(function(change) {
    console.log("In node " + change.before.parentPath + ":\n\t" + change.message);
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
* **tagComparison** - used to tweak the comparison logic, see "Advanced configuration" below

### Change objects

Change objects provide the following properties:

* **type** - `'added'`, `'removed'` or `'changed'` - depending on what type of change was detected.
* **message** - a printable message describing the change (colorized for use on XTerm-compatible terminals, with green for additions and red for removals)
* **before**, **after** - objects describing the location of the change in the old DOM and in the new DOM, respectively

The **before** and **after** objects share the same format and let you pinpoint the change if you want to, for example, modify the new DOM in response to changes. All properties starting with `$` are [cheerio][cheerio] selections, so you can call cheerio methods on them directly. The properties of **before** and **after** are as follows:

* **$node** - a reference to the node itself. If the node was added or removed, it will only be available only in **before.$node** (if it was removed) or only in in **after.$node** (if it was added)
* **$previous**, **$next** - especially useful for additions and removals, this pinpoint the location of the change by giving you references to surrounding nodes.
* **$parent** - this is a reference to the parent of the node that was added/changed/removed.
* **path** - a CSS selector for the node that was changed/added/removed. If the changed node was a text node, a comment or a directive (like <!DOCTYPE>), this property will be `undefined`. These types of nodes cannot be selected with CSS selectors, unfortunately. If it is provided, `$(change.before.path)` should always be the same as `change.before.$node` (and likewise for **after**).
* **parentPath** - a CSS selector for the parent of the changed/added/removed node. Unlike **path**, this property is always available - the parent is always an element node.
* **index** - the child index of the changed node. This index is calculated including text nodes, comment nodes, etc. This means that `change.before.$parent.contents()[change.before.index]` will give you the correct, but using `.children()` won't, as that property only includes element nodes. This property will be provided even if the node doesn't exist in the specific DOM (added nodes don't exist **before**, and removed nodes **after**) - in that case it will point to the index at which the node would be if it _was_ in the DOM in question.

## Advanced configuration

Hiff uses heuristics to guess whether a node is unchanged, edited, or completely replaced with a new one. This can be the difference between one "changed" in your diff (if the nodes in the old and new DOM are still deemed to be similar enough) and an "added"/"removed" pair (if hiff guesses they're not the same node).

The defaults should do OK in most situations, but you can influence the weights the heuristic uses with a `tagComparison` option:

```javascript
hiff.compare(html1, html2, {
    tagComparison: {name: 1, id: 1, attributes: 0, contents: 0}
});
```

This lets you influence the weights (relative to defaults) that Hiff will give to each of the four components when comparing tags: the **name** of the tag, the **id** attribute (which is treated separately from other attributes as important for identifying nodes), other **attributes**, and the **contents** of the tag (children and text). The default settings is `1` for each property. Setting it to a higher number will make this component more important, and to a lower number - less important. Setting it to 0 will make Hiff **completely ignore** the given component.

As a convenience you can also set a property to `false` with the same meaning as 0. If you don't provide all of them, only the
ones you specify will be changed, for example:

```javascript
// this will make Hiff treat <div>Blah</div> and <section>Blah</section> as identical
hiff.compare(html1, html2, {name: false}); 
```

### Custom comparators

_Here be dragons - don't do this unless there is no other way._ If there is no other way around your specific needs and the default heuristic fails you, you can provide your custom comparator function like this:

```javascript
hiff.compare(html1, html2, {tagComparison: comparatorFn});
function comparatorFn($n1, $n2, childChanges) {
  if ($n1.is("[magic]") && $n2.is("[magic]"))
    return ($n1.attr('magic') == $n2.attr('magic')) ? hiff.IDENTICAL : hiff.NOT_THE_SAME_NODE;
  else
    return hiff.defaultTagComparisonFn($n1, $n2, childChanges);
}
```

Your function will get two [cheerio][cheerio] nodes to be compared, and a list of changes for the tag's children (as an array of Hiff change objects). You can use those to decide whether the node should be treated as identical (return `hiff.IDENTICAL`), the same node with edits (return `hiff.SAME_BUT_DIFFERENT`), or completely different (return `hiff.NOT_THE_SAME_NODE`).

You can use `hiff.defaultTagComparisonFn` to only override a part of the normal logic and use the standard comparison for everything else, like in the example above.

[cheerio]: https://github.com/cheeriojs/cheerio
