module.exports = stringifyNode;

var nodeType = require('../util/cheerio-utils').nodeType;

/**
 * Takes a cheerio node and returns a concise string representation of it,
 * regardless of type. Also handles corner-cases like printing 'undefined'
 * or 'null' as '[nothing]'.
 *
 * @param $ the cheerio instance the node belongs to
 * @param $node the cheerio object for the node
 * @returns {string} a printable string
 */
function stringifyNode($node) {
  if (!$node)
    return "[nothing]";

  var n = $node[0];
  switch(nodeType($node)) {
    case 'text':
      var text = $node.text();
      if (text.length > 40)
        text = text.substring(0, 37) + "...";
      return '"' + text + '"';

    default:
      var $ = $node.cheerio;
      $clone = $node.clone();

      // shorten HTML if necessary
      var originalHTML = $clone.html();
      if (originalHTML && originalHTML.length > 80)
        $clone.html("...");

      return $.html($clone);
  }
}
