var util = require('util');

module.exports = nodePath;

// =======================================================

function nodePath($node) {
  var parent = $node.parent();

  if (!parent.length)
    return nodeSpecifier($node);

  var parentPath = nodePath($node.parent());
  if (parentPath)
    return parentPath + ' > ' + nodeSpecifier($node);
  else
    return nodeSpecifier($node);
}

function nodeSpecifier($node) {
  if (!$node.length)
    return '';

  if (!$node[0].name)
    return "[" + $node[0].type + "]";

  // the description of a node always includes the tag name
  var tagName = $node[0].name;
  if (tagName == 'root')
    return '';

  // if it has an id, that's preferred
  if ($node.attr('id')) {
    return util.format('%s#%s', tagName, $node.attr('id'));
  }

  // if it has classes, those are good too
  if ($node.attr('class')) {
    var classes = $node.attr('class').replace(/^\s+|\s+$/, '').split(/\s+/);
    return util.format('%s.%s', tagName, classes.join('.'));
  }

  // no distinguishing characteristics, use the index in parent
  var index = $node.prevAll().length;
  return util.format("%s[%d]", tagName, index);
}
