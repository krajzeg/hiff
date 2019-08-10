var compare = require('../').compare;
var assert = require('chai').assert;
var _ = require('lodash');

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
    var html1 = "<a>Ignored.</a>  <b>Compared.</b> <i>Ignored.</i>";
    var html2 = "<a>Or is it?</a> <b>Indeed...</b> <i>Or is it?</i>";

    var d = compare(html1, html2, {
      ignoreText: ['a', 'i']
    });

    // we expect two changes, the removal of old <b> and addition of a new one
    assert.ok(d.different);
    assert.lengthOf(d.changes, 2);
    assert.ok(_.every(d.changes, function(c) {
      return c.before.path == 'b' || c.after.path == 'b';
    }));
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
