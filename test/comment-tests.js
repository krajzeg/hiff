var diff = require('../src/hiff').diff;
var assert = require('chai').assert;


describe("Comment nodes", function () {
  it("should be ignored by default", function () {
    var html1 = "Hello <!-- cruel --> world!";
    var html2 = "Hello world!";
    var difference = diff(html1, html2);
    assert.isFalse(difference);
  });

  it("should be taken into account when required", function () {
    var html1 = "Hello <!-- cruel --> world!";
    var html2 = "Hello world!";
    var difference = diff(html1, html2, {ignoreComments: false});
    assert.ok(difference);
  });
});
