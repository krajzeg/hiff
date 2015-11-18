var assert = require('chai').assert;
var _ = require('underscore');
var hiff = require('../src/hiff');

describe("Similarity testing", function () {
  it("should report node as the same when similarity >=50%", function () {
    var html1 = "<div><b>same</b><b>same</b><b>nope</b><b>nope</b></div>";
    var html2 = "<div><b>same</b><b>same</b><i>yep</i><i>yep</i></div>";
    var d = hiff.compare(html1, html2);
    assert(d.different);
    assert.deepEqual(_.pluck(d.changes, 'type'), ['added', 'added', 'removed', 'removed']);
  });

  it("should report node as completely different when similarity <50%", function () {
    var html1 = "<div><b>same</b><b>nope</b><b>nope</b><b>nope</b></div>";
    var html2 = "<div><b>same</b><i>yep</i><i>yep</i><i>yep</i></div>";
    var d = hiff.compare(html1, html2);
    assert(d.different);
    assert.deepEqual(_.pluck(d.changes, 'type'), ['added', 'removed']);
  });
});
