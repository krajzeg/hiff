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
  // prepare the options object so we don't have to validate everything down the road
  options = prepareOptions(options);

  // parse both pieces of HTML with cheerio and get the root nodes
  $1 = cheerio.load(expected);
  $2 = cheerio.load(actual);
  var $n1 = node($1, $1.root());
  var $n2 = node($2, $2.root());

  // prepare input (remove or canonicalize things that produce false positives, strip ignored content)
  prepareForDiff($n1, options);
  prepareForDiff($n2, options);

  // compare the roots recursively
  var diffObject = compareNodes($n1, $n2, options);

  // strip some of the low-level information that compareNodes uses internally, return just the list of changes
  return diffObject && diffObject.changes;
}

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
