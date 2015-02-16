var _ = require('underscore');
var node = require('../util/cheerio-utils').node;

var canonicalizeText = require('../util/cheerio-utils').canonicalizeText;
var canonicalizeAttribute = require('../util/cheerio-utils').canonicalizeAttribute;
var changeTypes = require('./change-types');

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

var DiffLevel = require('./change-types').DiffLevel;

// ========================================================================================


function compareNodes($n1, $n2, options) {

  if (options.ignore) {
    if (isIgnored($n1) && isIgnored($n2))
      return false;
  }

  return findDifferences($n1, $n2);

  // ==========================================================================================

  function findDifferences($n1, $n2) {
    // if the types aren't the same, that means it's completely different
    if ($n1[0].type != $n2[0].type) {
      return {
        level: DiffLevel.NOT_THE_SAME_NODE,
        changes: [changeTypes.changed($n1, $n2)]
      };
    }

    // compare the nodes using logic specific to their type
    switch ($n1[0].nodeType) {
      case NodeType.TEXT_NODE:
        return compareTextNodes($n1, $n2);
      case NodeType.ELEMENT_NODE:
        return compareTags($n1, $n2);
      case NodeType.COMMENT_NODE:
        return false; // ignore comments for now
      default:
        throw new Error("Unrecognized node type: " + $n1[0].type + ", " + $n1[0].nodeType);
    }
  }

  function compareTags($n1, $n2) {
    var changes = [], dissimilarity = 0;

    // if the tags have different names, they're not very similar
    if ($n1[0].name != $n2[0].name) {
      changes.push(changeTypes.changed($n1, $n2));
      dissimilarity++;
    }

    // they should have the same attributes too
    var attributesOnNode1 = _.keys($n1[0].attribs);
    var attributesOnNode2 = _.keys($n2[0].attribs);
    var attributes = _.uniq(attributesOnNode1.concat(attributesOnNode2));

    _.map(attributes, function (attribute) {
      var value1 = canonicalizeAttribute($n1[0].attribs[attribute]);
      var value2 = canonicalizeAttribute($n2[0].attribs[attribute]);
      if (value1 != value2) {
        dissimilarity++;
        if (!changes.length)
          changes.push(changeTypes.changed($n1, $n2));
      }
    });

    // if we have at least two differences, we assume those are completely different nodes
    if (dissimilarity >= 2)
    return {
      level: DiffLevel.NOT_THE_SAME_NODE,
      changes: changes
    };

    // otherwise, we compare the children too, and return all the changes aggregated
    var childChanges = compareChildren($n1, $n2, options);
    changes = changes.concat(childChanges);
    if (childChanges.length)
      dissimilarity++;

    if (changes.length) {
      return {
        level: dissimilarity >= 2 ? DiffLevel.NOT_THE_SAME_NODE : DiffLevel.SAME_BUT_DIFFERENT,
        changes: changes
      };
    } else {
      return false;
    }
  }

  function compareChildren($n1, $n2, options) {
    var list1 = _.map($n1.contents(), function(n) {
      return node($n1.cheerio, n);
    });
    var list2 = _.map($n2.contents(), function(n) {
      return node($n2.cheerio, n);
    });
    return compareNodeLists($n1, list1, list2, options);
  }


  function compareNodeLists($parent, list1, list2, options) {
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
          var nodeCompare = compareNodes(pair[0], pair[1], options);
          if (nodeCompare) {
            changes = changes.concat(nodeCompare.changes);
          }
        });
      } else if (part.added) {
        var addedNodes = list2.slice(index2, index2 + part.count);
        index2 += part.count;
        changes = changes.concat(addedNodes.map(function(node) {
          return changeTypes.added($parent, node);
        }));
      } else if (part.removed) {
        var removedNodes = list1.slice(index1, index1 + part.count);
        index1 += part.count;
        changes = changes.concat(removedNodes.map(function(node) {
          return changeTypes.removed($parent, node);
        }));
      }
    });

    // end of the list, we're done
    return changes;
  }

  function compareTextNodes($n1, $n2) {
    var t1 = canonicalizeText($n1.text());
    var t2 = canonicalizeText($n2.text());
    if (t1 != t2) {
      return {
        level: DiffLevel.SAME_BUT_DIFFERENT,
        changes: [changeTypes.changed($n1, $n2)]
      };
    } else {
      return false;
    }
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


