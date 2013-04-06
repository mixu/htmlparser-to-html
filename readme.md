# htmlparser-to-html

Converts the JSON that [htmlparser](https://npmjs.org/package/htmlparser) (and probably [htmlparser2](https://npmjs.org/package/htmlparser2)) produces back to HTML.

Useful if you're doing some sort of transformation.

Tests are based on reversing the parser tests in htmlparser, so they are quite comprehensive.

## Usage

    var html = require('htmlparser-to-html');

    console.log(html([
            {   type: 'tag'
              , name: 'html'
              , children:
                 [ { type: 'tag'
                   , name: 'title'
                   , children: [ { data: 'The Title', type: 'text' } ]
                   }
                 , { type: 'tag'
                   , name: 'body'
                   , children: [ { data: 'Hello world', type: 'text' } ]
                   }
                 ]
              }
            ]));

    // outputs: <html><title>The Title</title><body>Hello world</body></html>

Of course, you probably want to generate the array from htmlparser.



