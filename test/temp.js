var diff = require('../src/hiff').diff;

var html1 = "<div> <b>1</b> <strong>2</strong> </div>";
var html2 = "<div> <b>1</b> <i>new</i> <strong>2</strong> </div>";
var d = diff(html1, html2);
console.log(d);
