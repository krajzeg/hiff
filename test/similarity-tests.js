var assert = require('chai').assert;
var _ = require('underscore');
var hiff = require('../src/hiff');

describe("Similarity testing", function () {
  it("should report node as the same when similarity >=50%", function () {
    var html1 = "<div><b>same</b><b>same</b><b>nope</b><b>nah</b></div>";
    var html2 = "<div><b>same</b><b>same</b><i>yep</i><i>yeah</i></div>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);

    // two adds, two removals, individually for the children
    assert.lengthOf(_.where(d.changes, {type: 'added'}), 2);
    assert.lengthOf(_.where(d.changes, {type: 'removed'}), 2);
  });

  it("should report node as completely different when similarity <50%", function () {
    var html1 = "<div><b>same</b><b>nope</b><b>nah</b><b>nein</b></div>";
    var html2 = "<div><b>same</b><i>yep</i><i>yeah</i><i>ja</i></div>";
    var d = hiff.compare(html1, html2);
    assert(d.different);

    // one add, one removal in this case- for the whole <div>
    assert.lengthOf(_.where(d.changes, {type: 'added'}), 1);
    assert.lengthOf(_.where(d.changes, {type: 'removed'}), 1);
  });
});
