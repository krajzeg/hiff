var diff = require('../src/hiff').diff;
var assert = require('chai').assert;

function noChange(html1, html2, options) {
  return function() {
    assert.isFalse(diff(html1, html2, options));
  };
}

describe("Ignoring", function () {
  it("should work for class selectors", noChange(
    "<div class='hi'>Hello</div>",
    "<div class='i g n o r e'>Ignore me</div>",
    {
      ignore: '.i'
    }
  ));
});
