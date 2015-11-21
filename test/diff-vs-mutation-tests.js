var compare = require('../src/hiff').compare;
var assert = require('chai').assert;
var fs = require('fs')
var _ = require('underscore')

describe("Similarity testing", function () {
  // NOTE: the goal isn't to pass this test, it's just to show the problems of using a heuristic
  // A naive solution could be that if we find nodes that have Ids that are the same then it's always marked as SAME_BUT_DIFFERENT
  // A better solution could be to just add an option for the user to override the handler and with a custom comparison function
  // ex: compare($before, $after), the user can set their own criterias (matching Ids, matching classes, matching attributes etc)
  it("should report no added or removed nodes for web pages of the same structure", function() {
    var html1 = fs.readFileSync(__dirname+'/fixtures/page-1.html', 'utf-8')
    var html2 = fs.readFileSync(__dirname+'/fixtures/page-2.html', 'utf-8')
    var d = compare(html1, html2);
    assert.ok(d.different);
    var addedNodes = _.filter(d.changes, {type: 'added'})
    var removedNodes = _.filter(d.changes, {type: 'removed'})
    assert.lengthOf(addedNodes, 0)
    assert.lengthOf(removedNodes, 0)
  });

  // Another more focused example just looking at a typical section of a content site
  it.only("should report sections of the same structure as the same", function() {
    const html1 = fs.readFileSync(__dirname+'/fixtures/section-1.html', 'utf-8')
    const html2 = fs.readFileSync(__dirname+'/fixtures/section-2.html', 'utf-8')
    var d = compare(html1, html2);
    assert.ok(d.different);
    assert.equal(d.changes[0].type, 'changed');
  });
});

