var _ = require('underscore');
var canonicalizeText = require('../util/cheerio-utils').canonicalizeText;
var node = require('../util/cheerio-utils').node;

module.exports = prepareForDiff;

// ===============================================================

function prepareForDiff($node) {
  cleanEmptyTextNodes($node);
}

function cleanEmptyTextNodes($node) {
  // is this a text node?
  if ($node[0].type == 'text') {
    // is it empty?
    var text = canonicalizeText($node.text());
    if (text == '') {
      // yup, remove it altogether
      $node.remove();
    }
  } else {
    // go through children doing the same
    _.each($node.contents(), function(subnode) {
      cleanEmptyTextNodes(node($node.cheerio, subnode));
    });
  }
}
