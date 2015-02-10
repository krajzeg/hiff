var _ = require('underscore');
var cheerio = require('cheerio');
var colors = require('colors');

module.exports = diff;

function diff(expected, actual, options) {
  // parse both pieces of HTML with cheerio
  $1 = cheerio.load(expected);
  $2 = cheerio.load(actual);

  // start comparing them at the root nodes
  return diffNodes($1.root(), $2.root());

  // ============================================================

  function diffNodes($n1, $n2) {
    // if one of the nodes is not present, that's a difference
    if (!$n1)
      return difference('extra-node', $n1, $n2);
    if (!$n2)
      return difference('missing-node', $n1, $n2);

    // if the types differ, that's not gonna work
    if ($n1[0].type != $n2[0].type)
      return difference('different-types', $n1, $n2);

    // compare the nodes using logic specific to their type
    var diff;
    switch ($n1[0].type) {
      case 'text': diff = compareTextNodes($n1, $n2); break;
      case 'tag':  diff = compareTags($n1, $n2); break;
      case 'root': break;
      default: throw new Error("Unrecognized node type: " + $n1[0].type);
    }
    if (diff) return diff;

    // the nodes themselves are identical - let's compare their children recursively
    var pairs = _.zip($n1.contents(), $n2.contents());

    var childDifference =  _.chain(pairs).map(function(pair) {
      var c1 = pair[0], c2 = pair[1];
      var $c1 = c1 && $1(c1), $c2 = c2 && $2(c2);
      return diffNodes($c1, $c2);
    }).find(function(difference) {
      return !!difference;
    }).value();
    if (childDifference)
      return childDifference;

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
      var child1 = pair[0], child2 = pair[1];
      var $c1 = child1 && $1(child1), $c2 = child2 && $2(child2);
      return diffNodes($c1, $c2);
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

  function stringifyNode($, $node) {
    if (!$node)
      return "[nothing]";

    if ($node[0].type == 'text') {
      var text = $node.text();
      if (text.length > 40)
        text = text.substring(0, 37) + "...";
      return '"' + text + '"';
    }

    $node.html("...");
    return $.html($node);
  }
}
