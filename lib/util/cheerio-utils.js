// list copied from MDN
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
    if (!$node) return $node;

    if ($node.type !== undefined) {
      // wrap
      $node = $($node);
    }
    $node.cheerio = $;

    // assign a random UID to each node
    if ($node.length && (!$node[0].__uid)) {
      $node[0].__uid = Math.random().toString().substring(2);
    }

    return $node;
  },

  nodeType: function ($node) {
    var domType = $node[0].nodeType;
    if ($node[0].data !== undefined) {
      // hack for faulty reporting on cheerio side (some things starting with <! are reported as comments)
      var data = $node[0].data;
      if (/^\[CDATA/.test(data))
        return 'directive';
      if (domType != NodeType.TEXT_NODE && domType != NodeType.COMMENT_NODE)
        return 'directive';
    }

    switch(domType) {
      case NodeType.TEXT_NODE: return 'text';
      case NodeType.ELEMENT_NODE: return 'element';
      case NodeType.COMMENT_NODE: return 'comment';
      default:
        throw new Error("Unhandled node type: " + $node[0].nodeType);
    }
  },

  // differs from $node.parent() in what it does at the top-level
  // the built-in .parent() returns an empty selection if the parent would be root
  // we actually want the root in that case
  safeParent: function($node) {
    var parent = $node.parent();
    return parent.length ? parent : $node.cheerio.root();
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
