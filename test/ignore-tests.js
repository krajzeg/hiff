var compare = require('../src/hiff').compare;
var assert = require('chai').assert;


describe("Ignoring nodes", function () {
  it("should work for class selectors", function () {
    var html1 = "<div class='ignore'>Hello</div><div>Hi</div>";
    var html2 = "<div class='ignore' data-see-how-different-i-am>Hello</div><div>Hi</div>";
    var result = compare(html1, html2, {ignore: ['.ignore']});
    assert.isFalse(result.different);
  });
});
