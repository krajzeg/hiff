var diff = require('../src/hiff').diff;
var assert = require('chai').assert;


describe("Ignoring nodes", function () {
  it("should work for class selectors", function () {
    var html1 = "<div class='ignore'>Old</div><div>Hi</div>";
    var html2 = "<div class='ignore'>New</div><div>Hi</div>";
    var difference = diff(html1, html2, {ignore: ['.ignore']});
    assert.isFalse(difference);
  });
});
