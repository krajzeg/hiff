var util = require('util');
var nodeType = require('../util/cheerio-utils').nodeType;

module.exports = cssPath;

// =======================================================

function cssPath($node) {
  // empty selections and selections for non-tag nodes don't have valid css paths
  if (!$node.length || nodeType($node) != 'element')
    return undefined;

  // recursion
  var parent = $node.parent();
  if (parent.length) {
    var parentPath = cssPath($node.parent());
    if (parentPath)
      return parentPath + ' > ' + nodeSelector($node);
    else
      return nodeSelector($node);
  } else {
    return nodeSelector($node);
  }
}

function nodeSelector($node) {
  if (!$node.length)
    return '';

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
