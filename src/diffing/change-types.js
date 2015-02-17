var _ = require('underscore');
var colors = require('colors');
var diff = require('./impl/diff');
var stringify = require('../display/stringify-node');
var nodePath = require('../display/node-path');

module.exports = {
  added: added,
  removed: removed,
  changed: changed,
  changedText: changedText,

  DiffLevel: {
    SAME_BUT_DIFFERENT: 'same_but_different',
    NOT_THE_SAME_NODE: 'not_the_same_node'
  }
};

// ==========================================================

function change($contextNode, changeObject) {
  return _.extend(changeObject, {
    in: $contextNode,
    path: nodePath($contextNode)
  });
}

function added($context, $node) {
  return change($context, {
    type: 'added',
    node: $node,
    message: "Added:    " + colors.green(stringify($node))
  });
}

function removed($context, $node) {
  return change($context, {
    type: 'removed',
    node: $node,
    message: "Removed:  " + colors.red(stringify($node))
  });
}

function changed($before, $after) {
  return change($before, {
    type: 'changed',
    oldNode: $before,
    newNode: $after,
    message: "Modified: " + coloredChanges(stringify($before), stringify($after))
  });
}

function changedText($before, $after) {
  return change($before.parent(), {
    type: 'changed',
    oldNode: $before,
    newNode: $after,
    message: "Modified: " + coloredChanges(stringify($before), stringify($after))
  });
}

function coloredChanges(beforeStr, afterStr) {
  var parts = diff.diffWords(beforeStr, afterStr);
  return _.map(parts, function(part) {
    var color = part.added ? 'green' : (part.removed ? 'red' : 'grey');
    return colors[color](part.value);
  }).join("");
}
