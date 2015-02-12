var _ = require('underscore');
var node = require('../util/cheerio-utils').node;
var colors = require('colors');

var stringifyNode = require('../display/stringify-node');
var canonicalizeText = require('../util/cheerio-utils').canonicalizeText;
var canonicalizeAttribute = require('../util/cheerio-utils').canonicalizeAttribute;

module.exports = compareNodes;

var NodeType = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
};

// ========================================================================================

function compareNodes($n1, $n2, options) {


  var differences = findDifferences($n1, $n2);
  if (differences) {
    // check if neither of the nodes is on our ignore list
    if (isIgnored($n1) || isIgnored($n2))
      return false;
  }

  return differences;

  // ==========================================================================================

  function findDifferences($n1, $n2) {
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
    switch ($n1[0].nodeType) {
      case NodeType.TEXT_NODE:
        diff = compareTextNodes($n1, $n2); break;
      case NodeType.ELEMENT_NODE:
        diff = compareTags($n1, $n2); break;
      case NodeType.COMMENT_NODE:
        return false; // ignore comments for now
      default:
        throw new Error("Unrecognized node type: " + $n1[0].type + ", " + $n1[0].nodeType);
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
      var value1 = canonicalizeAttribute($n1[0].attribs[attribute]);
      var value2 = canonicalizeAttribute($n2[0].attribs[attribute]);
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
      return compareNodes($c1, $c2, options);
    }).find(function(difference) {
      return !!difference;
    }).value();
  }

  function compareTextNodes($n1, $n2) {
    var t1 = canonicalizeText($n1.text());
    var t2 = canonicalizeText($n2.text());
    if (t1 != t2) {
      return difference('different-text', $n1, $n2);
    } else {
      return false;
    }
  }

  function compareDirectives($n1, $n2) {
    if ($n1[0].data != $n2[0].data) {
      return difference('different-directives', $n1, $n2);
    } else {
      return false;
    }
  }

  function difference(type, $n1, $n2) {
    var expected = "Expected: " + colors.green(stringifyNode($n1)) + "\n";
    var got = "Got:      " + colors.red(stringifyNode($n2));

    return type + "\n" + expected + got;
  }

  function isIgnored($node) {
    if (!$node) return false;
    if (!options.ignore) return false;
    if ($node[0].nodeType != NodeType.ELEMENT_NODE) return false;

    // a node is ignored if it matches any selector in options.ignore
    return _.any(options.ignore, function(selector) {
      return $node.is(selector);
    });
  }
}


