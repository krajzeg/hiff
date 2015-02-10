module.exports = {
  node: function node($, $node) {
    $node.cheerio = $;
    return $node;
  }
};
