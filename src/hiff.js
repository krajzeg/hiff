var _ = require('underscore');
var cheerio = require('cheerio');
var node = require('./util/cheerio-utils').node;

var compareNodes = require('./diffing/compare-nodes');
var prepareForDiff = require('./diffing/prepare-for-diff');
var changeTypes = require('./diffing/change-types');

module.exports = {
  compare: compare,

  added: changeTypes.added,
  removed: changeTypes.removed,
  changed: changeTypes.changed,

  // legacy method, only for 0.2.x compatibility
  diff: diff
};


var DEFAULT_OPTIONS = {
  ignoreComments: true
};

/// Compares two HTML strings, return a diff object describing the changes, if any.
function compare(before, after, options) {
  // prepare the options object so we don't have to validate everything down the road
  options = prepareOptions(options);

  // parse both pieces of HTML with cheerio and get the root nodes
  $1 = cheerio.load(before);
  $2 = cheerio.load(after);
  var $n1 = node($1, $1.root());
  var $n2 = node($2, $2.root());

  // prepare input (remove or canonicalize things that produce false positives, strip ignored content)
  prepareForDiff($n1, options);
  prepareForDiff($n2, options);

  // compare the roots recursively
  var diffObject = compareNodes($n1, $n2, options);

  // create a meaningful object describing the comparison result
  return {
    // actual results - was it different and what was changed?
    different: !!diffObject.changes,
    changes: diffObject ? diffObject.changes : [],

    // access to the strings that were compared
    before: before,
    after: after,

    // cheerioed copies of the strings, for making working with changes easy
    $before: $1,
    $after: $2
  };
}

// This is a method included for compatibility with code using hiff 0.2.x and prior.
// It differs from 'compare' in regards to the return value: 'diff' returns just the 'changes' list,
// or false if there aren't any.
function diff() {
  var result = compare.apply(null, [].slice.call(arguments));
  return result.different ? result.changes : false;
}

// Canonicalizes the options object so that they are always present and in the same format.
function prepareOptions(options) {
  // use defaults
  options = _.defaults(options || {}, DEFAULT_OPTIONS);

  // sanitize some types
  if (typeof options.ignore == 'string')
    options.ignore = [options.ignore];

  // make a place to store memoized comparison results
  options.memo = {};

  // return the new object
  return options;
}
