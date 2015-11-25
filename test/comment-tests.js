var compare = require('../').compare;
var assert = require('chai').assert;


describe("Comment nodes", function () {
  it("should be ignored by default", function () {
    var html1 = "Hello <!-- cruel --> world!";
    var html2 = "Hello world!";
    var result = compare(html1, html2);
    assert.isFalse(result.different);
  });

  it("should be taken into account when required", function () {
    var html1 = "Hello <!-- cruel --> world!";
    var html2 = "Hello world!";
    var result = compare(html1, html2, {ignoreComments: false});
    assert.ok(result.different);
  });
});
