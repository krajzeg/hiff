var cheerio = require('cheerio');
var assert = require('chai').assert;
var nodeType = require('../lib/util/cheerio-utils').nodeType;

function checkType(html, expectedType) {
  var $ = cheerio.load(html);
  var $node = $($.root().contents()[0]);
  assert.equal(nodeType($node), expectedType, "Type of " + html);
}

describe("Node types", function() {
  it("should be reported correctly for common node types", function() {
    checkType("<div>element</div>", 'element');
    checkType("Text", 'text');
    checkType("<!-- Comment -- >", 'comment');
    checkType("<![CDATA[  <cdata>  ]]>", 'directive');
    checkType("<!DOCTYPE doctype>", 'directive');
  });
});
