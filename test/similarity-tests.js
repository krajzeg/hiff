var assert = require('chai').assert;
var _ = require('underscore');
var hiff = require('../src/hiff');

describe("Similarity testing", function () {
  it("should report node as the same when similarity >=50%", function () {
    var html1 = "<div><b>same</b><b>same</b><b>nope</b><b>nope</b></div>";
    var html2 = "<div><b>same</b><b>same</b><i>yep</i><i>yep</i></div>";
    var d = hiff.diff(html1, html2);
    assert(d);
    assert.deepEqual(_.pluck(d, 'type'), ['added', 'added', 'removed', 'removed']);
  });

  it("should report node as completely different when similarity <50%", function () {
    var html1 = "<div><b>same</b><b>nope</b><b>nope</b><b>nope</b></div>";
    var html2 = "<div><b>same</b><i>yep</i><i>yep</i><i>yep</i></div>";
    var d = hiff.diff(html1, html2);
    assert(d);
    assert.deepEqual(_.pluck(d, 'type'), ['added', 'removed']);
  });
});
