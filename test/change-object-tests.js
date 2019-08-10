var _ = require('lodash');
var assert = require('chai').assert;
var hiff = require('../');

describe("Change objects", function() {

  it("should be valid for simple additions", function() {
    var html1 = "<div class='test'><a>A</a><b>B</b></div>";
    var html2 = "<div class='test'><a>A</a><i>I</i><b>B</b></div>";
    var d = hiff.compare(html1, html2);

    var change = d.changes[0];
    assert.equal(change.type, 'added');
    assert.ok(change.before);
    assert.ok(change.after);

    var $1 = d.$before, $2 = d.$after;
    var before = change.before, after = change.after;

    assert.strictEqual(before.path, undefined);   // node did not exist before
    assert.equal(before.parentPath, "div.test");       // but the parent did
    assert.equal(before.index, 1);                // inserted at index 1 in the old DOM

    assert.strictEqual(before.$node, undefined);  // node does not exist in the first DOM
    assert(before.$parent.is($1('div.test')));    // references to other nodes should be valid
    assert(before.$previous.is($1('a')));
    assert(before.$next.is($1('b')));

    assert.equal(after.path, "div.test > i");
    assert.equal(after.parentPath, "div.test");
    assert.equal(after.index, 1);

    assert(after.$node.is($2('i')));
    assert(after.$parent.is($2('div.test')));
    assert(after.$previous.is($2('a')));
    assert(after.$next.is($2('b')));
  });

  it("should be valid for simple removal", function() {
    var html1 = "<div class='test'><a>A</a><i>I</i><b>B</b></div>";
    var html2 = "<div class='test'><a>A</a><b>B</b></div>";
    var d = hiff.compare(html1, html2);

    var change = d.changes[0];
    assert.equal(change.type, 'removed');
    assert.ok(change.before);
    assert.ok(change.after);

    var $1 = d.$before, $2 = d.$after;
    var before = change.before, after = change.after;

    assert.strictEqual(before.path, "div.test > i");
    assert.equal(before.parentPath, "div.test");
    assert.equal(before.index, 1);

    assert(before.$node.is($1('i')));
    assert(before.$parent.is($1('div.test')));
    assert(before.$previous.is($1('a')));
    assert(before.$next.is($1('b')));

    assert.strictEqual(after.path, undefined);
    assert.equal(after.parentPath, "div.test");
    assert.equal(after.index, 1);

    assert.strictEqual(after.$node, undefined);
    assert(after.$parent.is($2('div.test')));
    assert(after.$previous.is($2('a')));
    assert(after.$next.is($2('b')));
  });

  it("should be valid for changes in element nodes", function() {
    var html1 = "<div class='test'><a>A</a><i>I</i><b>B</b></div>";
    var html2 = "<div class='test'><a>A</a><i class='new'>I</i><b>B</b></div>";
    var d = hiff.compare(html1, html2);
    assert.ok(d.different);

    var change = d.changes[0];
    assert.equal(change.type, 'changed');
    assert.ok(change.before);
    assert.ok(change.after);

    var $1 = d.$before, $2 = d.$after;
    var before = change.before, after = change.after;

    assert.equal(before.path, "div.test > i");
    assert.equal(before.parentPath, "div.test");
    assert.equal(before.index, 1);

    assert(before.$node.is($1('i')));
    assert(before.$parent.is($1('div.test')));
    assert(before.$previous.is($1('a')));
    assert(before.$next.is($1('b')));

    assert.equal(after.path, "div.test > i.new");
    assert.equal(after.parentPath, "div.test");
    assert.equal(after.index, 1);

    assert(after.$node.is($2('i')));
    assert(after.$parent.is($2('div.test')));
    assert(after.$previous.is($2('a')));
    assert(after.$next.is($2('b')));
  });

  it("should be valid for changes in text nodes", function() {
    var html1 = "<div class='test'><a>A</a><i class='change'>Yes.</i><b>B</b></div>";
    var html2 = "<div class='test'><a>A</a><i class='change'>No..</i><b>B</b></div>";
    var d = hiff.compare(html1, html2);

    var change = d.changes[0];
    assert.equal(change.type, 'changed');
    assert.ok(change.before);
    assert.ok(change.after);

    var $1 = d.$before, $2 = d.$after;
    var before = change.before, after = change.after;

    assert.strictEqual(before.path, undefined); // undefined since it's impossible to point to a text node
    assert.equal(before.parentPath, "div.test > i.change");
    assert.equal(before.index, 0);

    assert(before.$node.is($1('i').contents()[0]));
    assert(before.$parent.is($1('i')));
    assert(!before.$previous);
    assert(!before.$next);

    assert.equal(after.path,undefined);
    assert.equal(after.parentPath, "div.test > i.change");
    assert.equal(after.index, 0);

    assert(after.$node.is($2('i').contents()[0]));
    assert(after.$parent.is($2('i')));
    assert(!after.$previous);
    assert(!after.$next);
  });

  it("should be valid for changes in comments", function() {
    var html1 = "<div class='test'><a>A</a><!-- yes!! --><b>B</b></div>";
    var html2 = "<div class='test'><a>A</a><!-- no... --><b>B</b></div>";
    var d = hiff.compare(html1, html2, {ignoreComments: false});

    var change = d.changes[0];
    assert.equal(change.type, 'changed');
    assert.ok(change.before);
    assert.ok(change.after);

    var $1 = d.$before, $2 = d.$after;
    var before = change.before, after = change.after;

    assert.strictEqual(before.path, undefined); // undefined since it's impossible to point to a comment node
    assert.equal(before.parentPath, "div.test");
    assert.equal(before.index, 1);

    assert(before.$node.is($1('div').contents()[1]));
    assert(before.$parent.is($1('div')));
    assert(before.$previous.is($1('a')));
    assert(before.$next.is($1('b')));

    assert.equal(after.path,undefined);
    assert.equal(after.parentPath, "div.test");
    assert.equal(after.index, 1);

    assert(after.$node.is($2('div').contents()[1]));
    assert(after.$parent.is($2('div')));
    assert(after.$previous.is($2('a')));
    assert(after.$next.is($2('b')));
  });

  it("should be valid for changes in directives", function() {
    var html1 = "<div class='test'><a>A</a><![CDATA[yes!!]]><b>B</b></div>";
    var html2 = "<div class='test'><a>A</a><![CDATA[no...]]><b>B</b></div>";
    var d = hiff.compare(html1, html2, {ignoreComments: false});

    var change = d.changes[0];
    assert.equal(change.type, 'changed');
    assert.ok(change.before);
    assert.ok(change.after);

    var $1 = d.$before, $2 = d.$after;
    var before = change.before, after = change.after;

    assert.strictEqual(before.path, undefined); // undefined since it's impossible to point to a comment node
    assert.equal(before.parentPath, "div.test");
    assert.equal(before.index, 1);

    assert(before.$node.is($1('div').contents()[1]));
    assert(before.$parent.is($1('div')));
    assert(before.$previous.is($1('a')));
    assert(before.$next.is($1('b')));

    assert.equal(after.path,undefined);
    assert.equal(after.parentPath, "div.test");
    assert.equal(after.index, 1);

    assert(after.$node.is($2('div').contents()[1]));
    assert(after.$parent.is($2('div')));
    assert(after.$previous.is($2('a')));
    assert(after.$next.is($2('b')));
  });

  describe("with multiple additions", function() {
    var html1 = "<div><a>A</a><b>B</b></div>";
    var html2 = "<div><a>A</a><i>One.</i><p>Two.</p><b>B</b></div>";

    it("should provide correct indices", function() {
      var d = hiff.compare(html1, html2);
      var $1 = d.$before, $2 = d.$after;
      var ch1 = d.changes[0], ch2 = d.changes[1];

      // in the old DOM, both insertions sit at index 1
      assert.equal(ch1.before.index, 1);
      assert.equal(ch2.before.index, 1);
      // in the new DOM, they have separate indices
      assert.equal(ch1.after.index, 1);
      assert.equal(ch2.after.index, 2);
    });

    it("should provide $previous and $next correctly", function() {
      var d = hiff.compare(html1, html2);
      var $1 = d.$before, $2 = d.$after;
      var ch1 = d.changes[0], ch2 = d.changes[1];

      // in the old DOM, both sit between <a> and <b>
      assert(ch1.before.$previous.is($1('a')));
      assert(ch1.before.$next.is($1('b')));
      assert(ch2.before.$previous.is($1('a')));
      assert(ch2.before.$next.is($1('b')));
      // in the new DOM, they should see each other
      assert(ch1.after.$previous.is($2('a')));
      assert(ch1.after.$next.is($2('p')));
      assert(ch2.after.$previous.is($2('i')));
      assert(ch2.after.$next.is($2('b')));
    });
  });

  describe("with multiple removals", function() {
    var html1 = "<div><a>A</a><i>One.</i><p>Two.</p><b>B</b></div>";
    var html2 = "<div><a>A</a><b>B</b></div>";

    it("should provide correct indices", function() {
      var d = hiff.compare(html1, html2);
      var $1 = d.$before, $2 = d.$after;
      var ch1 = d.changes[0], ch2 = d.changes[1];

      // in the old DOM, the nodes have separate indices
      assert.equal(ch1.before.index, 1);
      assert.equal(ch2.before.index, 2);
      // in the new DOM, they both should be inserted at index 1
      assert.equal(ch1.after.index, 1);
      assert.equal(ch2.after.index, 1);
    });

    it("should provide $previous and $next correctly", function() {
      var d = hiff.compare(html1, html2);
      var $1 = d.$before, $2 = d.$after;
      var ch1 = d.changes[0], ch2 = d.changes[1];

      // in the old DOM, they see each other
      assert(ch1.before.$previous.is($1('a')));
      assert(ch1.before.$next.is($1('p')));
      assert(ch2.before.$previous.is($1('i')));
      assert(ch2.before.$next.is($1('b')));
      // in the new DOM, they both sit between <a> and <b>
      assert(ch1.after.$previous.is($2('a')));
      assert(ch1.after.$next.is($2('b')));
      assert(ch2.after.$previous.is($2('a')));
      assert(ch2.after.$next.is($2('b')));
    });
  });

  it("should give 'undefined' in $previous for changes to first node", function() {
    var html1 = "<div><a>A</a><b>B</b></div>";
    var html2 = "<div><b>B</b></div>";
    var d = hiff.compare(html1, html2);
    assert.equal(d.changes[0].before.$previous, undefined);
    assert.equal(d.changes[0].after.$previous, undefined);
  });

  it("should give 'undefined' in $next for changes to last node", function() {
    var html1 = "<div><a>A</a><b>B</b></div>";
    var html2 = "<div><a>A</a></div>";
    var d = hiff.compare(html1, html2);
    assert.equal(d.changes[0].before.$next, undefined);
    assert.equal(d.changes[0].after.$next, undefined);
  });

  it("should give the root in $parent and parentPath for top-level elements", function() {
    var html1 = "<div>Hi!</div>";
    var html2 = "<div class='greeting'>Hi!</div>";
    var d = hiff.compare(html1, html2);
    var $1 = d.$before, $2 = d.$after, ch = d.changes[0];

    assert(ch.before.$parent.is($1.root()));
    assert(ch.after.$parent.is($2.root()));
    assert.equal(ch.before.parentPath, ":root");
    assert.equal(ch.after.parentPath, ":root");
  });

  it("should give correct paths even when the parent node changes", function() {
    var html1 = "<div id='hi'><a>1</a></div>";
    var html2 = "<section id='hi'><a>1</a><b>2</b></section>";
    var d = hiff.compare(html1, html2);
    var $1 = d.$before, $2 = d.$after, ch = _.filter(d.changes, {type: 'added'})[0];

    assert.equal(ch.before.parentPath, 'div#hi');
    assert.equal(ch.after.parentPath, 'section#hi');
    assert.equal(ch.after.path, 'section#hi > b');
  });
});
