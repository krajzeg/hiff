var assert = require('chai').assert;
var _ = require('underscore');
var hiff = require('../src/hiff');

function removedOrAdded(changes, path) {
  return _.any(changes, function(c) {
    return (c.type == 'added' || c.type == 'removed') && (c.before.path == path || c.after.path == path);
  });
}

describe("Default tag comparator", function () {
  it("should report node as similar if just the ID matches but everything else changes", function() {
    var html1 = "<div id='itsme'>A</div>";
    var html2 = "<section id='itsme' class='selected'>B</section>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);
    assert(!removedOrAdded(d.changes, 'section#itsme'), "The <div> generated an add/remove change.");
    assert(!removedOrAdded(d.changes, 'div#itsme'), "The <div> generated an add/remove change.");
  });

  it("should report nodes that have just content as different if the content changes", function() {
    var html1 = "<div>A</div>";
    var html2 = "<div>B</div>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);
    assert(removedOrAdded(d.changes, 'div'), "The <div> did not generate an add/remove change.");
  });

  it("should report nodes that have the same content as the same if the tag changes", function() {
    var html1 = "<div>A</div>";
    var html2 = "<section>A</section>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);
    assert(!removedOrAdded(d.changes, 'div'), "The <div> generated an add/remove change.");
    assert(!removedOrAdded(d.changes, 'section'), "The <div> generated an add/remove change.");
  });

  it("should report nodes that have matching tag and attributes but different contents as similar", function() {
    var html1 = "<div class='button'>A</div>";
    var html2 = "<div class='button'>B</div>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);
    assert(!removedOrAdded(d.changes, 'div.button'), "The <div> generated an add/remove change.");
  });

  it("should consider tags similar if at least 50% attributes match", function() {
    var html1 = "<a class='button' href='http://a'>A</a>";
    var html2 = "<a class='button' href='http://b'>B</a>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);
    assert(!removedOrAdded(d.changes, 'a.button'), "The <a> generated an add/remove change.");
  });

  it("should consider tags different if more than 50% attributes differ", function() {
    var html1 = "<a class='button' href='http://a' target='a'>A</a>";
    var html2 = "<a class='button' href='http://b' target='b'>B</a>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);
    assert(removedOrAdded(d.changes, 'a.button'), "The <a> did not generate an add/remove change.");
  });

  it("should report nodes as similar when contents are >=50% similar", function () {
    var html1 = "<div><b>same</b><b>same</b><b>nope</b><b>nah</b></div>";
    var html2 = "<div><b>same</b><b>same</b><i>yep</i><i>yeah</i></div>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);

    // two adds, two removals, individually for the children
    assert.lengthOf(_.where(d.changes, {type: 'added'}), 2);
    assert.lengthOf(_.where(d.changes, {type: 'removed'}), 2);
  });

  it("should report nodes as different when contents are <50% similar", function () {
    var html1 = "<div><b>same</b><b>nope</b><b>nah</b><b>nein</b></div>";
    var html2 = "<div><b>same</b><i>yep</i><i>yeah</i><i>ja</i></div>";
    var d = hiff.compare(html1, html2);
    assert(d.different);

    // one add, one removal in this case- for the whole <div>
    assert.lengthOf(_.where(d.changes, {type: 'added'}), 1);
    assert.lengthOf(_.where(d.changes, {type: 'removed'}), 1);
  });

  it("should report empty node and node with different tag and some content as different", function () {
    var html1 = "<i></i>";
    var html2 = "<b>Hi.</b>";
    var d = hiff.compare(html1, html2);
    assert(d.different);

    // one add, one removal in this case- for the whole <div>
    assert(removedOrAdded(d.changes, 'i'), "The <i> did not generate an add/remove change.");
    assert(removedOrAdded(d.changes, 'b'), "The <b> did not generate an add/remove change.");
  });
});
