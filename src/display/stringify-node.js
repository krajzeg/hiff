module.exports = stringifyNode;

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
  switch(n.type) {
    case 'text':
      var text = $node.text();
      if (text.length > 40)
        text = text.substring(0, 37) + "...";
      return '"' + text + '"';

    case 'directive':
      return n.data;

    default:
      $node.html("...");
      return $node.cheerio.html($node);
  }
}
