var _ = require('underscore');
var canonicalizeText = require('../util/cheerio-utils').canonicalizeText;
var node = require('../util/cheerio-utils').node;
var nodeType = require('../util/cheerio-utils').nodeType;

module.exports = prepareForDiff;

// ===============================================================

function prepareForDiff($node, options) {
  // remove text nodes that don't have text in them
  removeEmptyTextNodes($node);
  // remove comments if needed
  if (options.ignoreComments)
    removeComments($node);

  // recurse into children
  _.each($node.contents(), function (subnode) {
    prepareForDiff(node($node.cheerio, subnode), options);
  });
}

function removeComments($node) {
  if (nodeType($node) == 'comment') {
    // in situations with text siblings on both sides, join them together
    collapseTextOnBothSidesOfComment($node);
    // either way, remove the comment itself
    $node.remove();
  }
}

function collapseTextOnBothSidesOfComment($comment) {
  // we have to use .contents() directly since .prev() .next() don't report text nodes
  var parent = $comment.parent();
  if (parent.length == 0)
    parent = $comment.cheerio.root();
  var contents = parent.contents().get();
  var index = [].concat(contents).indexOf($comment[0]);
  if (index <= 0 || index >= contents.length - 1)
    return;
  var left = contents[index-1], right = contents[index+1];

  // now that we have the siblings in hand, check if we need to do something
  if (left.type == 'text' && right.type == 'text') {
    // OK, text on both sides - collapse it!
    // this is also a bit more involved than we'd like, since we have to operate on the node itself
    var $left = node($comment.cheerio, left);
    var $right = node($comment.cheerio, right);
    left.data = $left.text() + ' ' + $right.text();
    $right.remove();
  }
}

function removeEmptyTextNodes($node) {
  // is this a text node?
  if (nodeType($node) == 'text') {
    // is it empty?
    if (canonicalizeText($node.text()) == '') {
      // yup, remove it altogether
      $node.remove();
    }
  }
}
