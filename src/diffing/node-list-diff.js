var diff = require('./impl/diff');
var compareNodes = require('./compare-nodes');
var DiffLevel = require('./change-types').DiffLevel;

// ====================================================

function createNodeDiff() {
  var d = new diff.Diff();
  d.equals = function($n1, $n2) {
    var changes = compareNodes($n1, $n2);
    return (!changes) || (changes.level == DiffLevel.SAME_BUT_DIFFERENT);
  };
  d.tokenize = function(nodeList) {
    return nodeList;
  };
  return d;
}

module.exports = {
  diffLists: function(oldNodes, newNodes) {
    var diff = createNodeDiff();
    return diff.diff(oldNodes, newNodes);
  }
};
