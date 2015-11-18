var compare = require('../src/hiff').compare;
var assert = require('chai').assert;


describe("Hiff at the very least", function () {
  it("should report no changes for identical HTML", function () {
    var html = "<div>Hello! <i>No changes here.</i></div>";
    var d = compare(html, html);
    assert.notOk(d.different);
  });

  it("should detect tag name changes", function () {
    var html1 = "<div>Hello!</div>";
    var html2 = "<b>Hello!</b>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should detect changed attributes", function() {
    var html1 = "<div class='john'></div>";
    var html2 = "<div class='jack'></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should detect missing attributes", function() {
    var html1 = "<div id='J' class='john'></div>";
    var html2 = "<div class='john'></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should detect extra attributes", function() {
    var html1 = "<div class='john'></div>";
    var html2 = "<div id='J' class='john'></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should detect text differences", function() {
    var html1 = "<div class='john'>John</div>";
    var html2 = "<div class='john'>Jack</div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should detect missing children", function() {
    var html1 = "<div class='john'><b>Ja</b><i>ck</i></div>";
    var html2 = "<div class='john'><b>Ja</b></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should detect extra children", function() {
    var html1 = "<div class='john'><b>Ja</b></div>";
    var html2 = "<div class='john'><b>Ja</b><i>ck</i></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should detect changed children", function() {
    var html1 = "<div class='john'><b>Ja</b><i>ck</i></div>";
    var html2 = "<div class='john'><b>Ja</b><i>smine</i></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

});
