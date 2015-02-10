var _ = require('underscore');
var cheerio = require('cheerio');
var colors = require('colors');

var compareNodes = require('./diffing/compare-nodes');

module.exports = {
  diff: diff
};

function diff(expected, actual, options) {
  // parse both pieces of HTML with cheerio
  $1 = cheerio.load(expected);
  $2 = cheerio.load(actual);

  var $root1 = $1.root(); $root1.cheerio = $1;
  var $root2 = $2.root(); $root2.cheerio = $2;

  // start comparing them at the root nodes
  return compareNodes($1.root(), $2.root());
}

