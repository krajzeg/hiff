var Diff = require('diff').Diff;
var compareNodes = require('./compare-nodes');
var node = require('../util/cheerio-utils').node;
var DiffLevel = require('./change-types').DiffLevel;

// ====================================================

function createNodeDiff(options) {
  var d = new Diff();

  // override equality to use our concept of Cheerio node equality
  d.equals = function($n1, $n2) {
    // jsdiff will pass us strings instead one of the nodes sometimes to check
    // for equality with empty string - we always say they're different
    if (typeof $n1 === 'string' || typeof $n2 === 'string') { return false; }

    // execute comparison
    var changes = compareNodes($n1, $n2, options);
    return (!changes) || (changes.level == DiffLevel.SAME_BUT_DIFFERENT);
  };

  // we compare things that are already lists, so tokenize is a no-op for us
  d.tokenize = function(nodeList) {
    return nodeList;
  };

  return d;
}

module.exports = {
  diffLists: function(oldNodes, newNodes, options) {
    var diff = createNodeDiff(options);
    return diff.diff(oldNodes, newNodes);
  }
};
