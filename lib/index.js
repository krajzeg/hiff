/*jshint node:true*/
"use strict";

var _ = require('lodash');
var cheerio = require('cheerio');
var node = require('./util/cheerio-utils').node;

var compareNodes = require('./diffing/compare-nodes');
var prepareForDiff = require('./diffing/prepare-for-diff');
var changeTypes = require('./diffing/change-types');

var createTagHeuristic = require('./diffing/tag-comparison-heuristic');

module.exports = {
  compare: compare,

  added: changeTypes.added,
  removed: changeTypes.removed,
  changed: changeTypes.changed,

  // constants and functions for use with custom comparators
  IDENTICAL: changeTypes.DiffLevel.IDENTICAL,
  SAME_BUT_DIFFERENT: changeTypes.DiffLevel.SAME_BUT_DIFFERENT,
  NOT_THE_SAME_NODE: changeTypes.DiffLevel.NOT_THE_SAME_NODE,

  defaultTagComparisonFn: createTagHeuristic()
};


var DEFAULT_OPTIONS = {
  // a list of selectors to ignore - nodes that match won't influence the comparison
  ignore: [],

  // if set to true, comments will be stripped from the content before comparison,
  // so differences in comments won't count
  ignoreComments: true,

  // if provided, this is a list of selectors for which text nodes will be ignored
  // in the comparison. Setting to true is the same ['*'], meaning text is always ignored.
  ignoreText: []
};

/// Compares two HTML strings, return a diff object describing the changes, if any.
function compare(before, after, options) {
  // prepare the options object so we don't have to validate everything down the road
  options = prepareOptions(options);

  // parse both pieces of HTML with cheerio and get the root nodes
  var $1 = cheerio.load(before);
  var $2 = cheerio.load(after);
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

// Canonicalizes the options object so that they are always present and in the same format.
function prepareOptions(options) {
  // use defaults
  options = _.defaults(options || {}, DEFAULT_OPTIONS);

  // disenchant magic values
  if (options.ignoreText === true) {
    options.ignoreText = ['*'];
  }
  options.tagComparison = prepareTagHeuristic(options.tagComparison);

  // sanitize lists
  ['ignore', 'ignoreText'].map(function(name) {
    options[name] = ensureArray(options[name]);
  });

  // make a place to store memoized comparison results
  options.memo = {};

  // return the new object
  return options;
}

// Prepares the tag comparison heuristic based on the option.
function prepareTagHeuristic(tagComparison) {
  if (typeof tagComparison === 'undefined') {
    return createTagHeuristic(); // default heuristic
  } else if (typeof tagComparison === 'function') {
    return tagComparison; // custom, user-provided function
  } else if (typeof tagComparison === 'object') {
    return createTagHeuristic(tagComparison); // options for the default heuristic
  } else {
    throw new Error("Invalid 'tagComparison' option provided: " + tagComparison);
  }
}

// Ensures that the value of an option is an array, turning other values into single-element
// arrays when necessary.
function ensureArray(option) {
  return (option.length === undefined) ? [option] : option;
}
