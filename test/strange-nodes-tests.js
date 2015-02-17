var diff = require('../src/hiff').diff;
var assert = require('chai').assert;


describe("Directive nodes", function () {
  it("should report changes when different", function() {
    var html1 = "<!DOCTYPE html>";
    var html2 = "<!DOCTYPE bananaml>";
    var difference = diff(html1, html2);
    assert.ok(difference);
  });

  it("should not report changes when identical", function() {
    var html1 = "<!DOCTYPE bananaml>";
    var html2 = "<!DOCTYPE bananaml>";
    var difference = diff(html1, html2);
    assert.isFalse(difference);
  });

  it("should be completely different than tags", function() {
    var html1 = "<!DOCTYPE bananaml>";
    var html2 = "<div></div>";
    var difference = diff(html1, html2);
    assert.ok(difference);
  });
});

describe("CDATA nodes", function () {
  it("should report changes when different", function() {
    var html1 = "<![CDATA[  <>  ]]>";
    var html2 = "<![CDATA[  ><  ]]>";
    var difference = diff(html1, html2);
    assert.ok(difference);
  });

  it("should not report changes when identical", function() {
    var html1 = "<![CDATA[  <>  ]]>";
    var html2 = "<![CDATA[  <>  ]]>";
    var difference = diff(html1, html2);
    assert.isFalse(difference);
  });

  it("should be completely different than tags", function() {
    var html1 = "<![CDATA[  <>  ]]>";
    var html2 = "<div></div>";
    var difference = diff(html1, html2);
    assert.ok(difference);
  });
});
