var compare = require('../').compare;
var assert = require('chai').assert;
var fs = require('fs');
var _ = require('lodash');
var path = require('path');

function compareFixtures(file1, file2, options) {
  var path1 = path.join(__dirname, "fixtures", file1);
  var path2 = path.join(__dirname, "fixtures", file2);
  var html1 = fs.readFileSync(path1, 'utf-8').toString();
  var html2 = fs.readFileSync(path2, 'utf-8').toString();

  return compare(html1, html2, options);
}

describe("Hiff", function () {
  it("should deal with completely replacing content of a deeply nested tag", function() {
    var d = compareFixtures("replaced-content-before.html", "replaced-content-after.html");
    assert.ok(d.different);
    // all changes detected should be addtions/removals within the <section id='content'> tag
    _.each(d.changes, function(c) {
      assert.ok(c.type == 'added' || c.type == 'removed');
      assert.equal(c.after.parentPath, 'html > body > div#page-wrapper > section#content');
    });
  });

  it("should deal with content with special comparison requirements", function() {
    var d = compareFixtures("custom-logic-before.html", "custom-logic-after.html", {
      // we'd like to treat tag names as the only thing that has to match
      tagComparison: {name: true, id: false, attributes: false, contents: false}
    });
    assert.ok(d.different);
    // we expect 4 'changed' for each of the <article> tags
    // plus a slew of additions for the newly introduced tags
    var articleChanges = _.filter(d.changes, function(c) {
      return (c.before.$node && c.before.$node.is('article')) ||
             (c.after.$node && c.after.$node.is('article'));
    });
    assert.lengthOf(articleChanges, 4);
    assert(_.every(articleChanges, {type: 'changed'}), "There were additions/removals for <article> tags.");
  });

  it("paragraph soups with no classes or IDs", function() {
    var d = compareFixtures("paragraph-soup-before.html", "paragraph-soup-after.html");
    assert.ok(d.different);
    assert(_.every(d.changes, {type: 'added'}), "There were non-addition changes.");
    assert(_.every(d.changes, function(c) {
      return c.after.$node.is('p');
    }), "Some changes were concerning non-<p> nodes.");
  });
});

