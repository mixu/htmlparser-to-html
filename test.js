var util = require('util'),
    assert = require('assert'),

    html = require('./index.js'),
    htmlparser = require('htmlparser');

// test cases are auto-generated  since we just check that
// html(htmlparser(original)) == original is true
var cases = {
  "Basic test": "<html><title>The Title</title><body>Hello world</body></html>",
  "Single Tag 1": "<br>text",
  "Unescaped chars in script": "<head><script language=\"Javascript\">var foo = \"<bar>\"; alert(2 > foo); var baz = 10 << 2; var zip = 10 >> 1; var yap = \"<<>>>><<\";</script></head>",
  "Special char in comment": "<head><!-- commented out tags <title>Test</title>--></head>",
  "Script source in comment": "<script><!--var foo = 1;--></script>",
  "Unescaped chars in style": "<style type=\"text/css\">\n body > p\n  { font-weight: bold; }</style>",
  "Singular attribute": "<option value=\"foo\" selected=\"selected\"></option>",
  "Text outside tags": "Line one\n<br>\nline two",
  "Only text": "this is the text",
  "Comment within text": "this is <!-- the comment --> the text",
  "Comment within text within script": "<script>this is <!-- the comment --> the text</script>",
  "XML Namespace": "<ns:tag>text</ns:tag>",
};

function parse(html) {
  var handler = new htmlparser.DefaultHandler(function(error, dom) {
      if(error) throw error;
    }, { verbose: false, ignoreWhitespace: true });
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(html);
  // silly async/sync hybrid
  return handler.dom;
}

// this generates the exports tests
Object.keys(cases).forEach(function(testName) {
  var expected, original;
  // if the output will differ from the input due to the permissive parsing, store the real expected value
  if(Array.isArray(cases[testName])) {
    original = cases[testName][0];
    expected = cases[testName][1];
  } else {
    expected = original = cases[testName];
  }
  exports[testName] = function() {

//    console.log(util.inspect(parse(original), false, 10, true));
    assert.equal(html(parse(original)), original);
  }
});

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('./node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
