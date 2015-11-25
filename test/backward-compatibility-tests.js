var legacyDiff = require('../').diff;
var assert = require('chai').assert;
var _ = require('underscore');

describe("Legacy diff() method", function () {
  it("should return just the changes when there are some", function() {
    var html1 = "<b>Hi!</b>", html2 = "<b>Hello!</b>";
    var d = legacyDiff(html1, html2);
    assert.ok(d);
    assert.lengthOf(d, 2);
    assert.lengthOf(_.where(d, {type: 'added'}), 1);
    assert.lengthOf(_.where(d, {type: 'removed'}), 1);
  });

  it("should return false when there are no changes", function() {
    var html = "<div>Hello! <i>No changes here.</i></div>";
    var d = legacyDiff(html, html);
    assert.strictEqual(d, false);
  });

  it("should pass options along to compare()", function() {
    var html1 = "<a>Ignore</a>", html2 = "<a>please</a>";
    var d = legacyDiff(html1, html2, {ignore: 'a'});
    assert.notOk(d);
  });
});
