module.exports = {
  node: function node($, $node) {
    if ($node.type !== undefined) {
      // wrap
      $node = $($node);
    }
    $node.cheerio = $;

    // assign a random UID to each node
    if (!$node[0].__uid)
      $node[0].__uid = Math.random().toString().substring(2);

    return $node;
  },

  canonicalizeText: function canonicalizeText(text) {
    text = module.exports.canonicalizeAttribute(text); // same as for attributes
    text = text.replace(/^\s+|\s+$/g, ''); // plus a trim
    text = text.replace(/\s+/g, ' '); // and make all whitespace a space
    return text;
  },

  canonicalizeAttribute: function(attributeValue) {
    if (attributeValue === undefined)
      return undefined;
    return attributeValue.replace(/\n\s+/g, ' ');
  }
};
