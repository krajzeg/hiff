var _ = require('underscore');
var node = require('../util/cheerio-utils').node;
var colors = require('colors');

var stringifyNode = require('../display/stringify-node');
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

var DiffLevel = {
  SAME_BUT_DIFFERENT: 'same_but_different',
  NOT_THE_SAME_NODE: 'not_the_same_node'
};

// ========================================================================================


function compareNodes($n1, $n2, options) {

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

    // if the inner HMTL is different, it counts as a dissimilarity point too
    // which might tip us over into thinking it's a completely new node
    if ((dissimilarity == 1) && ($n1.html() != $n2.html()))
      dissimilarity++;

    // if we have at least two differences, we assume those are completely different nodes
    if (dissimilarity >= 2)
    return {
      level: DiffLevel.NOT_THE_SAME_NODE,
      changes: changes
    };

    // otherwise, we compare the children too, and return all the changes aggregated
    var childChanges = compareChildren($n1, $n2, options);
    changes = changes.concat(childChanges);

    if (changes.length) {
      return {
        level: DiffLevel.SAME_BUT_DIFFERENT,
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
    var pairs = _.zip(list1, list2);
    var changes = [], done = false;

    _.each(pairs, function(pair, index) {
      // this flag might be set if we went into recursive mode
      // (_.each is just less convenient than loops, can't return from outer func)
      if (done) return;

      // extract nodes
      var $n1 = pair[0], $n2 = pair[1];

      // if one of the nodes is missing, it's an easy case
      if (!$n1) {
        changes.push(changeTypes.added($parent, $n2));
        return;
      }
      if (!$n2) {
        changes.push(changeTypes.removed($parent, $n1));
        return;
      }

      // now, we need to compare
      var comparison = compareNodes($n1, $n2, options);
      if (comparison) {
        // there is a difference, but our behavior depends on how serious it is
        // if the node is recognizable as 'the same thing', we just store the
        // changes - but if it's not, we try to determine what was added/removed
        if (comparison.level == DiffLevel.SAME_BUT_DIFFERENT) {
          // same node with alterations - store the differences
          changes = changes.concat(comparison.changes);
        } else if (comparison.level == DiffLevel.NOT_THE_SAME_NODE) {
          // either something was added or something was removed
          // compare how many differences we have in each scenario and pick the better matching one
          var addedSub1 = list1.slice(index), addedSub2 = list2.slice(index+1);
          var removedSub1 = list1.slice(index+1), removedSub2 = list2.slice(index);

          var changesIfAdded = compareNodeLists($parent, addedSub1, addedSub2);
          var changesIfRemoved = compareNodeLists($parent, removedSub1, removedSub2);

          // pick the scenario which cause the least amount of changes and return
          // (since our recursion dealt with the whole remainder of the list)
          if (changesIfAdded.length < changesIfRemoved.length) {
            changes = changes.concat(
              [changeTypes.added($parent, $n2)],
              changesIfAdded
            );
          } else {
            changes = changes.concat(
              [changeTypes.removed($parent, $n1)],
              changesIfRemoved
            );
          }

          // we have recursively processed the whole list, so we skip the rest of the iteration
          done = true;
        }
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


