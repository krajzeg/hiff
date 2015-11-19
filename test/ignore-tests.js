var compare = require('../src/hiff').compare;
var assert = require('chai').assert;


describe("Ignoring nodes", function () {
  it("should work for class selectors", function () {
    var html1 = "<div class='ignore'>Hello</div><div>Hi</div>";
    var html2 = "<div class='ignore' data-see-how-different-i-am>Hello</div><div>Hi</div>";
    var result = compare(html1, html2, {ignore: ['.ignore']});
    assert.isFalse(result.different);
  });
});

describe("Ignoring text", function() {
  it("should be disabled by default", function() {
    assert.ok(compare("<a>Hi.</a>", "<a>Hello.</a>").different);
  });

  it("should work for a list of selectors", function() {
    var html1 = "<a>Ignored.</a>  <b>Compared.</b> <i class='nope'>Ignored.</i>";
    var html2 = "<a>Or is it?</a> <b>Indeed...</b> <i class='nope'>Or is it?</i>";

    var d = compare(html1, html2, {
      ignoreText: ['a', '.nope']
    });

    // we expect one change, only from the <b>
    assert.ok(d.different);
    assert.lengthOf(d.changes, 1);
    assert.ok(d.changes[0].oldNode.parent().is('b'));
  });

  it("should interpret 'true' to mean 'ignore content of all text nodes'", function() {
    var html1 = "<a>Ignored.</a>  <b>Ignored.</b> <i class='nope'>Ignored.</i>";
    var html2 = "<a>Or is it?</a> <b>Indeed.</b> <i class='nope'>Or is it?</i>";

    var d = compare(html1, html2, {
      ignoreText: true
    });

    // we expect no changes
    assert.ok(!d.different);
  });
});
