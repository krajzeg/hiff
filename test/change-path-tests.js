var compare = require('../src/hiff').compare;
var assert = require('chai').assert;

describe("Paths reported for changes", function () {
  it("should include element IDs if present", function () {
    var html1 = "<div id='hello'>Hello!</div>";
    var html2 = "<div id='hello'>Hi!</div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
    assert.equal(d.changes[0].path, "div#hello");
  });

  it("should include classes if present", function () {
    var html1 = "<div class='hi there'>Hello!</div>";
    var html2 = "<div class='hi there'>Hi!</div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
    assert.equal(d.changes[0].path, "div.hi.there");
  });

  it("should fall back to index if no ID or class", function () {
    var html1 = "<div></div><div>Hello!</div><em></em>";
    var html2 = "<div></div><div>Hi!</div><em></em>";
    var d = compare(html1, html2);
    assert.ok(d.different);
    assert.equal(d.changes[0].path, "div:nth-of-type(2)");
  });

  it("should nest correctly for deeper changes", function() {
    var html1 = "<div id='outer'><div class='inner'><div>Hi!</div></div></div>";
    var html2 = "<div id='outer'><div class='inner'><div>Hello!</div></div></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
    assert.equal(d.changes[0].path, "div#outer > div.inner > div");
  });

  it("should use :nth-child(n) to disambiguate classless, id-less nodes", function() {
    var html1 = "<div id='outer'><div class='inner'><div>A</div><div>B</div> <div>C</div></div></div>";
    var html2 = "<div id='outer'><div class='inner'><div>A</div><div>Whoops.</div> <div>C</div></div></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
    assert.equal(d.changes[0].path, "div#outer > div.inner > div:nth-of-type(2)");
  });
});
