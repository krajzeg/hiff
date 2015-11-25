var compare = require('../').compare;
var assert = require('chai').assert;

describe("Text nodes", function() {
  it("should be correctly compared even on top level", function() {
    var html1 = "Hi.";
    var html2 = "Hello.";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });
});