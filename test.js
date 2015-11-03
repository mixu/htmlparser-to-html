var util = require('util'),
    assert = require('assert'),

    html = require('./index.js'),
    htmlparser = require('htmlparser');

// Configuration can be applied like this
// html.configure({disableAttribEscape: true});

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

  "plain text": "This is the text",
  "simple tag": ["<div>", "<div></div>" ],
  "simple comment": "<!-- content -->",
  "simple cdata": "<![CDATA[ content ]]>",
  "text before tag": ["xxx<div>", "xxx<div></div>"],
  "text after tag": ["<div>xxx", "<div>xxx</div>"],
  "text inside tag": "<div>xxx</div>",
  "attribute with single quotes": ["<div a='1'>", "<div a=\"1\"></div>"],
  "attribute with double quotes": ["<div a=\"1\">", "<div a=\"1\"></div>"],
  "attribute with no quotes": ["<div a=1>", "<div a=\"1\"></div>"],
  "attribute with no value": ["<div weird>", "<div weird=\"weird\"></div>"],
  "attribute with no value, trailing text": ["<div weird>xxx", "<div weird=\"weird\">xxx</div>"],
  "tag with multiple attributes": ["<div a=\"1\" b=\"2\">", "<div a=\"1\" b=\"2\"></div>"],
  "tag with multiple attributes, trailing text": ["<div a=\"1\" b=\"2\">xxx", "<div a=\"1\" b=\"2\">xxx</div>"],
  "tag with mixed attributes #1": ["<div a=1 b='2' c=\"3\">", "<div a=\"1\" b=\"2\" c=\"3\"></div>" ],
  "tag with mixed attributes #2": ["<div a=1 b=\"2\" c='3'>", "<div a=\"1\" b=\"2\" c=\"3\"></div>" ],
  "tag with mixed attributes #3": ["<div a='1' b=2 c=\"3\">", "<div a=\"1\" b=\"2\" c=\"3\"></div>" ],
  "tag with mixed attributes #4": ["<div a='1' b=\"2\" c=3>", "<div a=\"1\" b=\"2\" c=\"3\"></div>" ],
  "tag with mixed attributes #5": ["<div a=\"1\" b=2 c='3'>", "<div a=\"1\" b=\"2\" c=\"3\"></div>" ],
  "tag with mixed attributes #6": ["<div a=\"1\" b='2' c=\"3\">", "<div a=\"1\" b=\"2\" c=\"3\"></div>" ],
  "tag with mixed attributes, trailing text": ["<div a=1 b='2' c=\"3\">xxx", "<div a=\"1\" b=\"2\" c=\"3\">xxx</div>"],
  "self closing tag": [ "<div/>", "<div></div>"],
  "self closing tag, trailing text": ["<div/>xxx", "<div></div>xxx"],
  "self closing tag with spaces #1": ["<div />", "<div></div>"],
  "self closing tag with spaces #2": ["<div/ >", "<div></div>"],
  "self closing tag with spaces #3": ["<div / >", "<div></div>"],
  "self closing tag with spaces, trailing text": ["<div / >xxx", "<div></div>xxx"],
  "self closing tag with attribute": ["<div a=b />", "<div a=\"b\"></div>"],
  "self closing tag with attribute, trailing text": [ "<div a=b />xxx", "<div a=\"b\"></div>xxx"],
  "attribute missing close quote": [ "<div a=\"1><span id=\"foo\">xxx", "<div 1=\"1\" a=\"a\"><span id=\"foo\">xxx</span></div>"],
  "text before complex tag": ["xxx<div yyy=\"123\">", "xxx<div yyy=\"123\"></div>"],
  "text after complex tag": ["<div yyy=\"123\">xxx", "<div yyy=\"123\">xxx</div>"],
  "text inside complex tag": ["<div yyy=\"123\">xxx</div>", "<div yyy=\"123\">xxx</div>"],
  "nested tags": "<div><span></span></div>",
  "nested tags with attributes": ["<div aaa=\"bbb\"><span 123='456'>xxx</span></div>", "<div aaa=\"bbb\"><span 123=\"456\">xxx</span></div>"],
  "comment inside tag": "<div><!-- comment text --></div>",
  "cdata inside tag": "<div><![CDATA[ CData content ]]></div>",
  "html inside comment": "<!-- <div>foo</div> -->",
  "quotes in attribute #1": ["<div xxx='a\"b'>", "<div xxx=\"a&#34;b\"></div>"],
  "quotes in attribute #2": ["<div xxx=\"a'b\">", "<div xxx=\"a'b\"></div>"],
  "brackets in attribute": ["<div xxx=\"</div>\">", "<div xxx=\"xxx\"></div>\""],
  "unfinished simple tag #1": ["<div", "<div></div>"],
  "unfinished simple tag #2": ["<div ", "<div></div>"],
  "unfinished complex tag #1": ["<div foo=\"bar\"", "<div foo=\"bar\"></div>"],
  "unfinished complex tag #2": ["<div foo=\"bar\" ", "<div foo=\"bar\"></div>"],
  "unfinished attribute #1": ["<div foo=\"bar", "<div foo=\"foo\" bar=\"bar\"></div>"],
  "unfinished attribute #2": ["<div foo=\"", "<div foo=\"foo\"></div>"],
  "spaces in tag #1": ["< div>", "<div></div>"],
  "spaces in tag #2": ["<div >", "<div></div>"],
  "spaces in tag #3": ["< div >", "<div></div>"],
  "spaces in closing tag #1": ["< /div>", ""],
  "spaces in closing tag #2": ["</ div>", ""],
  "spaces in closing tag #3": ["</div >", ""],
  "spaces in closing tag #4": ["< / div >", ""],
  "spaces in tag, trailing text": ["< div >xxx", "<div>xxx</div>"],
  "spaces in attributes #1": ["<div foo =\"bar\">", "<div foo=\"bar\"></div>"],
  "spaces in attributes #2": ["<div foo= \"bar\">", "<div foo=\"bar\"></div>"],
  "spaces in attributes #3": ["<div foo = \"bar\">", "<div foo=\"bar\"></div>"],
  "spaces in attributes #4": ["<div foo =bar>", "<div foo=\"bar\"></div>"],
  "spaces in attributes #5": ["<div foo= bar>", "<div foo=\"bar\"></div>"],
  "spaces in attributes #6": ["<div foo = bar>", "<div foo=\"bar\"></div>"],
  "mixed case tag": ["<diV>", "<diV></diV>"],
  "upper case tag": ["<DIV>", "<DIV></DIV>"],
  "mixed case attribute": ["<div xXx=\"yyy\">", "<div xXx=\"yyy\"></div>"],
  "upper case case attribute": ["<div XXX=\"yyy\">", "<div XXX=\"yyy\"></div>"],
  "multiline simple tag": ["<\ndiv\n>", "<div></div>"],
  "multiline complex tag": ["<\ndiv\nid='foo'\n>", "<div id=\"foo\"></div>"],
  "multiline comment": "<!--\ncomment text\n-->",
  "cdata comment": "<![CDATA[\nCData content\n]]>",
  "multiline attribute #1": ["<div id='\nxxx\nyyy\n'>", "<div id=\"\nxxx\nyyy\n\"></div>"],
  "multiline attribute #2": ["<div id=\"\nxxx\nyyy\n\">", "<div id=\"\nxxx\nyyy\n\"></div>"],
  "tags in script tag code": ["<script language='javascript'>\nvar foo = '<bar>xxx</bar>';\n</script>", "<script language=\"javascript\">\nvar foo = '<bar>xxx</bar>';\n</script>"],
  "closing script tag in script tag code": ["<script language='javascript'>\nvar foo = '</script>';\n</script>", "<script language=\"javascript\">\nvar foo = '</script>';\n"],
  "comment in script tag code": ["<script language='javascript'>\nvar foo = '<!-- xxx -->';\n</script>", "<script language=\"javascript\">\nvar foo = '<!-- xxx -->';\n</script>"],
  "cdata in script tag code": ["<script language='javascript'>\nvar foo = '<![CDATA[ xxx ]]>';\n</script>", "<script language=\"javascript\">\nvar foo = '<![CDATA[ xxx ]]>';\n</script>"],
  "commented script tag code": ["<script language='javascript'>\n<!--\nvar foo = '<bar>xxx</bar>';\n//-->\n</script>", "<script language=\"javascript\"><!--\nvar foo = '<bar>xxx</bar>';\n//--></script>"],
  "cdata in script tag": ["<script language='javascript'>\n<![CDATA[\nvar foo = '<bar>xxx</bar>';\n]]>\n</script>", "<script language=\"javascript\">\n<![CDATA[\nvar foo = '<bar>xxx</bar>';\n]]>\n</script>"]
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
    assert.equal(html(parse(original)), expected);
  }
});

exports['escape double quotation marks'] = function() {
  var result = html({ type: 'tag', name: 'p', attribs: { foo: 'a"b'} });
  assert.equal(result, '<p foo=\"a&#34;b\"></p>');
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('./node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
