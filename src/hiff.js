var _ = require('underscore');
var cheerio = require('cheerio');
var node = require('./util/cheerio-utils').node;
var compareNodes = require('./diffing/compare-nodes');

module.exports = {
  diff: diff
};

function diff(expected, actual, options) {
  // parse both pieces of HTML with cheerio
  $1 = cheerio.load(expected);
  $2 = cheerio.load(actual);

  // start comparing them at the root nodes
  return compareNodes(node($1, $1.root()), node($2, $2.root()));
}

