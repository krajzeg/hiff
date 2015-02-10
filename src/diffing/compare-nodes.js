var _ = require('underscore');
var stringifyNode = require('../display/stringify-node');
var node = require('../util/cheerio-utils').node;
var colors = require('colors');

module.exports = compareNodes;

// ========================================================================================

function compareNodes($n1, $n2) {
  // if one of the nodes is not even present, that's a pretty big difference
  if (!$n1)
    return difference('extra-node', $n1, $n2);
  if (!$n2)
    return difference('missing-node', $n1, $n2);

  // if the types aren't the same, that's not gonna work
  if ($n1[0].type != $n2[0].type)
    return difference('different-types', $n1, $n2);

  // compare the nodes using logic specific to their type
  var diff;
  switch ($n1[0].type) {
    case 'text': diff = compareTextNodes($n1, $n2); break;
    case 'tag':
    case 'root':
      diff = compareTags($n1, $n2); break;
    default: throw new Error("Unrecognized node type: " + $n1[0].type);
  }
  if (diff) return diff;

  // no meaningful differences found, return false
  return false;
}

function compareTags($n1, $n2) {
  // if the tags have different names, they're not very similar
  if ($n1[0].name != $n2[0].name)
    return difference('different-tags', $n1, $n2);

  // they should have the same attributes too
  var attributesOnNode1 = _.keys($n1[0].attribs);
  var attributesOnNode2 = _.keys($n2[0].attribs);
  var attributes = _.uniq(attributesOnNode1.concat(attributesOnNode2));

  var attributeDifference = _.chain(attributes).map(function(attribute) {
    var value1 = $n1[0].attribs[attribute];
    var value2 = $n2[0].attribs[attribute];
    if (value1 === undefined)
      return difference('extra-attribute', $n1, $n2, {attribute: attribute});
    if (value2 === undefined)
      return difference('missing-attribute', $n1, $n2, {attribute: attribute});
    if (value1 != value2)
      return difference('different-attribute', $n1, $n2, {attribute: attribute});
  }).find(function(difference) {
    return !!difference;
  }).value();
  if (attributeDifference)
    return attributeDifference;

  // their children should also be identical to each other, so we recurse down
  var childPairs = _.zip($n1.contents(), $n2.contents());
  return _.chain(childPairs).map(function(pair) {
    // create child nodes (with cheerio references)
    var child1 = pair[0], child2 = pair[1];
    var $c1 = child1 && node($1, $1(child1));
    var $c2 = child2 && node($2, $2(child2));
    return compareNodes($c1, $c2);
  }).find(function(difference) {
    return !!difference;
  }).value();
}

function compareTextNodes($n1, $n2) {
  if ($n1.text() != $n2.text()) {
    return difference('different-text', $n1, $n2);
  } else {
    return false;
  }
}

function difference(type, $n1, $n2) {
  var expected = "Expected: " + colors.green(stringifyNode($1, $n1)) + "\n";
  var got = "Got:      " + colors.red(stringifyNode($2, $n2));

  return type + "\n" + expected + got;
}


