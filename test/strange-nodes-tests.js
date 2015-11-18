var compare = require('../src/hiff').compare;
var assert = require('chai').assert;


describe("Directive nodes", function () {
  it("should report changes when different", function() {
    var html1 = "<!DOCTYPE html>";
    var html2 = "<!DOCTYPE bananaml>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should not report changes when identical", function() {
    var html1 = "<!DOCTYPE bananaml>";
    var html2 = "<!DOCTYPE bananaml>";
    var d = compare(html1, html2);
    assert.notOk(d.different);
  });

  it("should be completely different than tags", function() {
    var html1 = "<!DOCTYPE bananaml>";
    var html2 = "<div></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });
});

describe("CDATA nodes", function () {
  it("should report changes when different", function() {
    var html1 = "<![CDATA[  <>  ]]>";
    var html2 = "<![CDATA[  ><  ]]>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });

  it("should not report changes when identical", function() {
    var html1 = "<![CDATA[  <>  ]]>";
    var html2 = "<![CDATA[  <>  ]]>";
    var d = compare(html1, html2);
    assert.notOk(d.different);
  });

  it("should be completely different than tags", function() {
    var html1 = "<![CDATA[  <>  ]]>";
    var html2 = "<div></div>";
    var d = compare(html1, html2);
    assert.ok(d.different);
  });
});
