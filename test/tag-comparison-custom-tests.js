var assert = require('chai').assert;
var _ = require('underscore');
var hiff = require('../');

describe("Custom tag comparators", function() {
  it("should work correctly", function() {
    var html1 = "<div magic='id'>It's like...</div>";
    var html2 = "<p magic='id'>...magic</p>";
    var d = hiff.compare(html1, html2, {tagComparison: comparatorFn});
    assert.ok(!d.different);

    function comparatorFn($n1, $n2, childChanges) {
      if ($n1.is("[magic]") && $n2.is("[magic]"))
        return ($n1.attr('magic') == $n2.attr('magic')) ? hiff.IDENTICAL : hiff.NOT_THE_SAME_NODE;
      else
        return hiff.defaultTagComparisonFn($n1, $n2, childChanges);
    }
  });
});
