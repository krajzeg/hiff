var compare = require('../').compare;
var assert = require('chai').assert;

function noChange(html1, html2) {
  return function() {
    assert.isFalse(compare(html1, html2).different);
  };
}

describe("Semantic comparison", function () {
  it("should ignore whitespace between tags", noChange(
    "<div>Hello</div><div>Hi!</div>",
    "<div>Hello</div> \n  <div>Hi!</div>"
  ));

  it("should ignore leading/trailing whitespace in text", noChange(
    "<div> \n Hello \n </div>",
    "<div>Hello\n</div>"
  ));

  it("should understand newlines in attributes", noChange(
    "<meta content='This is some content.'>",
    "<meta content='This\n is some\n      content.'>"
  ));
});
