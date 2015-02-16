var diff = require('./impl/diff');
var compareNodes = require('./compare-nodes');
var DiffLevel = require('./change-types').DiffLevel;

// ====================================================

function createNodeDiff(options) {
  var d = new diff.Diff();
  d.equals = function($n1, $n2) {
    var changes = compareNodes($n1, $n2, options);
    return (!changes) || (changes.level == DiffLevel.SAME_BUT_DIFFERENT);
  };
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
