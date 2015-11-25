var assert = require('chai').assert;
var cheerio = require('cheerio');
var stringifyNode = require('../lib/display/stringify-node');
var node = require('../lib/util/cheerio-utils').node;

describe("stringifyNode()", function() {
  it("should return the outer HTML if it's short enough", function() {
    var $ = cheerio.load('<div class="hi">There.</div>');
    var $node = node($, $('div'));
    assert.equal(stringifyNode($node), '<div class="hi">There.</div>');
  });

  it("should return '[nothing]' for empty selections", function() {
    var $ = cheerio.load("<a>Hi.</a>");
    var $node = node($, $('b'));
    assert.equal(stringifyNode($node), "[nothing]");
  });

  it("should strip contents if HTML is too long", function() {
    var longString = (new Array(100)).join("x");
    var $ = cheerio.load('<div class="hi">' + longString + '</div>');
    var $node = node($, $('div'));
    assert.equal(stringifyNode($node), '<div class="hi">...</div>');
  });

  it("should shorten long text nodes", function() {
    var longString = (new Array(100)).join("x");
    var $ = cheerio.load('<div class="hi">' + longString + '</div>');
    var $node = node($, $('div').contents()[0]);

    var stringified = stringifyNode($node);
    assert.ok(stringified.length < longString.length);
    assert.ok(/\.\.\."$/.test(stringified));
  });
});