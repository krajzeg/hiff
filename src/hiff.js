var _ = require('underscore');
var cheerio = require('cheerio');
var node = require('./util/cheerio-utils').node;

var compareNodes = require('./diffing/compare-nodes');
var prepareForDiff = require('./diffing/prepare-for-diff');
var changeTypes = require('./diffing/change-types');

module.exports = {
  diff: diff,

  added: changeTypes.added,
  removed: changeTypes.removed,
  changed: changeTypes.changed
};


var DEFAULT_OPTIONS = {
  ignoreComments: true
};

function diff(expected, actual, options) {
  // sanitize the options object so we don't have to validate everything down the road
  options = _.defaults(options || {}, DEFAULT_OPTIONS);
  if (typeof options.ignore == 'string')
    options.ignore = [options.ignore];

  // make a place to store memoized comparison results
  options.memo = {};

  // parse both pieces of HTML with cheerio and get the root nodes
  $1 = cheerio.load(expected);
  $2 = cheerio.load(actual);
  var $n1 = node($1, $1.root());
  var $n2 = node($2, $2.root());

  // prepare (remove some things that produces false positives)
  prepareForDiff($n1, options);
  prepareForDiff($n2, options);

  // compare the roots recursively
  return compareNodes($n1, $n2, options);
}
