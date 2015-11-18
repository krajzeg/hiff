var compare = require('../src/hiff').compare;
var cheerio = require('cheerio');
var nodePath = require('../src/display/node-path');
var assert = require('chai').assert;


describe("nodePath()", function() {
  it("should prefer to identify elements by ID", function() {
    var html = "<div id='hello'></div>";
    assert.equal(nodePathFor(html, '#hello'), 'div#hello');
  });

  it("should use classes if possible", function() {
    var html = "<div class='button disabled'></div>";
    assert.equal(nodePathFor(html, 'div'), 'div.button.disabled');
  });

  it("should use just the tag name if there is nothing else and it's unambiguous", function() {
    var html = "<div>Well.</div>";
    assert.equal(nodePathFor(html, 'div'), 'div');
  });

  it("should produce nested paths properly", function() {
    var html = '<a id="hi"><b class="hello"><div>Hi!</div></b>';
    assert.equal(nodePathFor(html, 'div'), 'a#hi > b.hello > div');
  });

  it("should use nth-of-type() to disambiguate between identical nodes", function() {
    var html = "<a>One.</a><a>Two.</a><a>Three.</a>";
    var $ = cheerio.load(html);
    var $secondA = $($('a')[1]);
    assert.equal(nodePath($secondA), "a:nth-of-type(2)");
  });

  it("should use nth-of-type() to disambiguate even if classes are present", function() {
    var html = '<a class="red">One.</a><a class="red">Two.</a><a class="red">Three.</a>';
    var $ = cheerio.load(html);
    var $secondA = $($('a')[1]);
    assert.equal(nodePath($secondA), "a.red:nth-of-type(2)");
  });
});

function nodePathFor(html, selector) {
  var $ = cheerio.load(html);
  return nodePath($(selector));
}
