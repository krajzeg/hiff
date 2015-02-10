var diff = require('../src/hiff').diff;
var assert = require('chai').assert;


describe("diff", function() {
    it("should report no changes for identical HTML", function() {
      var html = "<div>Hello!</div>";
      assert.equal(diff(html, html), false);
    });

    it("should detect tag name changes", function() {
      var html1 = "<div>Hello!</div>";
      var html2 = "<b>Hello!</b>";
      assert(diff(html1, html2));
    });
});
