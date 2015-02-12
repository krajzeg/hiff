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

  if ($node[0].type == 'text') {
    var text = $node.text();
    if (text.length > 40)
      text = text.substring(0, 37) + "...";
    return '"' + text + '"';
  }

  $node.html("...");
  return $node.cheerio.html($node);
}
