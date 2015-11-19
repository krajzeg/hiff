var util = require('util');

module.exports = cssPath;

// =======================================================

function cssPath($node) {
  var parent = $node.parent();

  if (!parent.length)
    return nodeSpecifier($node);

  var parentPath = cssPath($node.parent());
  if (parentPath)
    return parentPath + ' > ' + nodeSpecifier($node);
  else
    return nodeSpecifier($node);
}

function nodeSpecifier($node) {
  if (!$node.length)
    return '';

  if (!$node[0].name)
    return "<<" + $node[0].type + ">>";

  // the description of a node always includes the tag name
  var tagName = $node[0].name;
  if (tagName == 'root')
    return '';

  var specifier = tagName;
  if ($node.attr('id')) {
    // if we have an id, that's preferred
    specifier += '#' + $node.attr('id');
  } else if ($node.attr('class')) {
    // if we have no id, then let's add a class
    var classes = $node.attr('class').replace(/^\s+|\s+$/, '').split(/\s+/);
    specifier += '.' + classes.join('.');
  }

  // we've now specified as much as we can - if this is not unique yet,
  // we'll have to grudgingly add an :nth-child(n) pseudo-class to disambiguate
  var matchesAnythingElse = ($node.prevAll(specifier).length + $node.nextAll(specifier).length) > 0; // .siblings() doesn't seem to work as expected
  if (matchesAnythingElse) {
    // not unique enough!
    var index = $node.prevAll(specifier).length + 1; // CSS indices are one-based
    return specifier + util.format(":nth-of-type(%d)", index);
  } else {
    // unique enough!
    return specifier;
  }
}
