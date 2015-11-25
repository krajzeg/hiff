var _ = require('lodash');
var node = require('../util/cheerio-utils').node;

var canonicalizeText = require('../util/cheerio-utils').canonicalizeText;
var canonicalizeAttribute = require('../util/cheerio-utils').canonicalizeAttribute;
var nodeType = require('../util/cheerio-utils').nodeType;
var changeTypes = require('./change-types');

module.exports = compareNodes;

var DiffLevel = require('./change-types').DiffLevel;

// ========================================================================================

function compareNodes($n1, $n2, options) {
  var key = $n1[0].__uid + ':' + $n2[0].__uid;

  // do we have a memoized result?
  if (options.memo && (options.memo[key] !== undefined)) {
    return options.memo[key];
  }

  // should we ignore the comparison completely?
  if (options.ignore) {
    if (isIgnored($n1) && isIgnored($n2))
      return false;
  }

  // compare and memoize result
  var result = findDifferences($n1, $n2, options);
  if (options.memo) {
    options.memo[key] = result;
  }

  // return
  return result;

  // ==========================================================================================

  function findDifferences($n1, $n2, options) {
    // determine node types
    var type1 = nodeType($n1), type2 = nodeType($n2);

    // if the types aren't the same, that means it's completely different
    if (type1 != type2) {
      return {
        level: DiffLevel.NOT_THE_SAME_NODE,
        changes: [changeTypes.changed($n1, $n2)]
      };
    }

    // compare the nodes using logic specific to their type
    switch (type1) {
      case 'text': return compareTextNodes($n1, $n2, options.ignoreText);
      case 'element': return compareTags($n1, $n2, options.tagComparison);
      case 'directive':
      case 'comment':
        return compareOuterHTML($n1, $n2);
      default:
        throw new Error("Unrecognized node type: " + type1);
    }
  }

  // Compares tags using a heuristic provided from outside.
  function compareTags($n1, $n2, heuristic) {
    var localChanges = _.compact([getLocalTagChange($n1, $n2)]);
    var childChanges = compareChildren($n1, $n2, options);
    var diffLevel = heuristic($n1, $n2, childChanges);

    if (diffLevel == DiffLevel.IDENTICAL) {
      return false;
    } else {
      return { level: diffLevel, changes: localChanges.concat(childChanges) }
    }
  }

  // Checks whether there are "local" changes between the two tags - differing tag name or attributes.
  // Changes in content are considered "child" changes and are not taken into account here.
  function getLocalTagChange($n1, $n2) {
    var different = false;

    // same tag name?
    if ($n1[0].name != $n2[0].name) {
      return changeTypes.changed($n1, $n2);
    }

    // same attributes?
    var attributesOnNode1 = _.keys($n1[0].attribs);
    var attributesOnNode2 = _.keys($n2[0].attribs);
    var allAttributes = _.uniq(attributesOnNode1.concat(attributesOnNode2));

    var attributesDiffer = _.any(allAttributes, function (attribute) {
      var value1 = canonicalizeAttribute($n1[0].attribs[attribute]);
      var value2 = canonicalizeAttribute($n2[0].attribs[attribute]);
      return (value1 != value2);
    });
    if (attributesDiffer) {
      return changeTypes.changed($n1, $n2);
    }

    // no changes found
    return false;
  }

  function compareChildren($n1, $n2, options) {
    var list1 = _.map($n1.contents(), function(n) {
      return node($n1.cheerio, n);
    });
    var list2 = _.map($n2.contents(), function(n) {
      return node($n2.cheerio, n);
    });
    return compareNodeLists($n1, $n2, list1, list2, options);
  }


  function compareNodeLists($parent1, $parent2, list1, list2, options) {
    var nodeDiff = require('./node-list-diff');
    var parts = nodeDiff.diffLists(list1, list2, options);

    // map the result from the diff module to something matching our needs
    var index1 = 0, index2 = 0, changes = [];
    _.each(parts, function(part) {
      // unchanged parts
      if (!part.added && !part.removed) {
        var nodesToCheck = _.zip(list1.slice(index1, index1 + part.count), list2.slice(index2, index2 + part.count));
        index1 += part.count; index2 += part.count;
        _.each(nodesToCheck, function(pair) {
          var nested = compareNodes(pair[0], pair[1], options);
          if (nested) {
            changes = changes.concat(nested.changes);
          }
        });
      } else if (part.added) {
        var addedNodes = list2.slice(index2, index2 + part.count);
        changes = changes.concat(addedNodes.map(function($node, offset) {
          return changeTypes.added($node, $parent1, index1, $parent2, index2 + offset);
        }));
        index2 += part.count;
      } else if (part.removed) {
        var removedNodes = list1.slice(index1, index1 + part.count);
        changes = changes.concat(removedNodes.map(function($node, offset) {
          return changeTypes.removed($node, $parent1, index1 + offset, $parent2, index2);
        }));
        index1 += part.count;
      }
    });

    // end of the list, we're done
    return changes;
  }

  function compareTextNodes($n1, $n2, ignoredParents) {
    // check for 'ignoreText' settings first
    if (textNodesShouldBeIgnored($n1, $n2, ignoredParents))
      return false;

    // canonicalize whitespace etc. to get reliable results
    var t1 = canonicalizeText($n1.text());
    var t2 = canonicalizeText($n2.text());

    if (t1 != t2) {
      return {
        level: DiffLevel.SAME_BUT_DIFFERENT,
        changes: [changeTypes.changedText($n1, $n2)]
      };
    } else {
      return false;
    }
  }

  function textNodesShouldBeIgnored($n1, $n2, ignoredParents) {
    var $parent1 = $n1.parent(), $parent2 = $n2.parent();
    if (!$parent1 || !$parent2)
      return false;

    // we ignore the contents of the nodes if both parents match
    // any of the ignored selectors
    return _.any(ignoredParents, function(selector) {
      return $parent1.is(selector) && $parent2.is(selector);
    });
  }

  function compareOuterHTML($n1, $n2) {
    var html1 = $n1.cheerio.html($n1);
    var html2 = $n2.cheerio.html($n2);
    if (html1 != html2) {
      return {
        level: DiffLevel.SAME_BUT_DIFFERENT,
        changes: [changeTypes.changedText($n1, $n2)]
      };
    } else {
      return false;
    }
  }

  function isIgnored($node) {
    if (!$node) return false;
    if (!options.ignore) return false;
    if (nodeType($node) != 'element') return false;

    // a node is ignored if it matches any selector in options.ignore
    return _.any(options.ignore, function(selector) {
      return $node.is(selector);
    });
  }
}


