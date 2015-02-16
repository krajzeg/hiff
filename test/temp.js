var hiff = require('../src/hiff');

var html1 = "<div> <b>1</b> <strong>2</strong> </div>";
var html2 = "<div> <b>1</b> <i>new</i> <strong>2</strong> </div>";
var d = hiff.diff(html1, html2);

