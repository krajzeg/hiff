"use strict";

var _ = require('underscore');
var changeTypes = require('./change-types');
var DiffLevel = changeTypes.DiffLevel;
var canonicalizeAttribute = require('../util/cheerio-utils').canonicalizeAttribute;

module.exports = createHeuristic;

function createHeuristic(options) {
  return heuristic;

  function heuristic($n1, $n2, childChanges) {
    var foundChanges = 0, possibleChanges = 0;

    // this flag will be set to true if we're at least SAME_BUT_DIFFERENT
    var different = false;

    // if the tags have different names, they're not very similar
    possibleChanges++;
    if ($n1[0].name != $n2[0].name) {
      different = true;
      foundChanges++;
    }

    // they should have the same attributes too
    var attributesOnNode1 = _.keys($n1[0].attribs);
    var attributesOnNode2 = _.keys($n2[0].attribs);
    var attributes = _.uniq(attributesOnNode1.concat(attributesOnNode2));
    possibleChanges += attributes.length;

    _.map(attributes, function (attribute) {
      var value1 = canonicalizeAttribute($n1[0].attribs[attribute]);
      var value2 = canonicalizeAttribute($n2[0].attribs[attribute]);
      if (value1 != value2) {
        foundChanges++;
        different = true;
      }
    });

    // we compare the children too, and return all the changes aggregated
    possibleChanges += _.max([$n1.contents().length, $n2.contents().length]);
    _.each(childChanges, function(change) {
      if (change.in == $n1 || change.in == $n2) {
        switch(change.type) {
          case 'added':
          case 'removed':
            foundChanges += 0.5;
            break;
          default:
            foundChanges += 1;
        }
      }
    });
    if (childChanges.length > 0) {
      different = true;
    }

    // no changes?
    if (!different)
      return DiffLevel.IDENTICAL;

    // if we're different, determine similarity to find out if this is the same node, or completely different
    var similarity = 1.0 - (foundChanges / possibleChanges);
    return (similarity < 0.51) ? DiffLevel.NOT_THE_SAME_NODE : DiffLevel.SAME_BUT_DIFFERENT;
  }
}
