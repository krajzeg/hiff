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

  nodeType: function ($node) {
    switch($node[0].nodeType) {
      case NodeType.TEXT_NODE: return 'text';
      case NodeType.COMMENT_NODE: return 'comment';
      case NodeType.ELEMENT_NODE:
        if ($node[0].data) {
          return 'directive';
        } else {
          return 'element';
        }
        break;

      default:
        throw new Error("Unhandled node type: ", $node[0].nodeType);
    }
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
