var assert = require('chai').assert;
var _ = require('underscore');
var hiff = require('../src/hiff');

describe("Tag comparison configuration", function() {
  describe("should let you ignore", function() {
    it("tag names", function() {
      var html1 = "<div>1</div>";
      var html2 = "<span>1</span>";
      var d = hiff.compare(html1, html2, {tagComparison: {name: false}});
      assert.ok(!d.different);
    });
    it("ids", function() {
      var html1 = "<div id='a'>1</div>";
      var html2 = "<div id='b'>1</div>";
      var d = hiff.compare(html1, html2, {tagComparison: {id: false}});
      assert.ok(!d.different);
    });
    it("attributes", function() {
      var html1 = "<div class='a'>1</div>";
      var html2 = "<div class='b'>1</div>";
      var d = hiff.compare(html1, html2, {tagComparison: {attributes: false}});
      assert.ok(!d.different);
    });
    it("contents", function() {
      var html1 = "<div>1</div>";
      var html2 = "<div>2</div>";
      var d = hiff.compare(html1, html2, {tagComparison: {contents: false}});

      // this is tricky - there will still be a change, but it will be to the text node
      // inside only - the <div> won't be considered to have changed
      assert.ok(d.different);
      assert.lengthOf(d.changes, 1);
      assert(d.changes[0].before.$node.is(d.$before('div').contents()[0]));
    });
  });

  it("should let you tweak the relative weights of components", function() {
    var html1 = "<div>1</div>";
    var html2 = "<div>2</div>";
    var d = hiff.compare(html1, html2, {tagComparison: {names: 1, contents: 0.5}});
    // this should be a 'changed' result, because our tweaks made the contents less relevant
    // and they now count as similar
    assert.ok(d.different);
    assert.lengthOf(d.changes, 1);
    assert.equal(d.changes[0].type, 'changed');
  });
});