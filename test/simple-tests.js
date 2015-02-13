var diff = require('../src/hiff').diff;
var assert = require('chai').assert;


describe("Hiff", function () {
  it("should report no changes for identical HTML", function () {
    var html = "<div>Hello!</div>";
    var d = diff(html, html);
    assert.equal(d, false);
  });

  it("should detect tag name changes", function () {
    var html1 = "<div>Hello!</div>";
    var html2 = "<b>Hello!</b>";
    var difference = diff(html1, html2);
    assert(difference);
  });

  it("should detect changed attributes", function() {
    var html1 = "<div class='john'></div>";
    var html2 = "<div class='jack'></div>";
    var difference = diff(html1, html2);
    assert(difference);
  });

  it("should detect missing attributes", function() {
    var html1 = "<div id='J' class='john'></div>";
    var html2 = "<div class='john'></div>";
    var difference = diff(html1, html2);
    assert(difference);
  });

  it("should detect extra attributes", function() {
    var html1 = "<div class='john'></div>";
    var html2 = "<div id='J' class='john'></div>";
    var difference = diff(html1, html2);
    assert(difference);
  });

  it("should detect text differences", function() {
    var html1 = "<div class='john'>John</div>";
    var html2 = "<div class='john'>Jack</div>";
    var difference = diff(html1, html2);
    assert(difference);
  });

  it("should detect missing children", function() {
    var html1 = "<div class='john'><b>Ja</b><i>ck</i></div>";
    var html2 = "<div class='john'><b>Ja</b></div>";
    var difference = diff(html1, html2);
    assert(difference);
  });

  it("should detect extra children", function() {
    var html1 = "<div class='john'><b>Ja</b></div>";
    var html2 = "<div class='john'><b>Ja</b><i>ck</i></div>";
    var difference = diff(html1, html2);
    assert(difference);
  });

  it("should detect changed children", function() {
    var html1 = "<div class='john'><b>Ja</b><i>ck</i></div>";
    var html2 = "<div class='john'><b>Ja</b><i>smine</i></div>";
    var difference = diff(html1, html2);
    assert(difference);
  });

  // TODO: make it work again
 /* it("should handle directives", function() {
    var html1 = "<!DOCTYPE html>";
    var html2 = "<!DOCTYPE bananaml>";
    var difference = diff(html1, html2);
    assert(difference);
  });*/

});
