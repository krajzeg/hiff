var hiff = require('../src/hiff');
var assert = require('chai').assert;

describe("Hiff", function() {
    it("should report no changes for identical HTML", function() {
      var html = "<div>Hello!</div>";
      assert.equal(hiff(html, html), false);
    });
});
