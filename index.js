var emptyTags = {
  "area": 1,
  "base": 1,
  "basefont": 1,
  "br": 1,
  "col": 1,
  "frame": 1,
  "hr": 1,
  "img": 1,
  "input": 1,
  "isindex": 1,
  "link": 1,
  "meta": 1,
  "param": 1,
  "embed": 1,
  "?xml": 1
};

function html(item) {
  // apply recursively to arrays
  if(Array.isArray(item)) {
    return item.map(html).join('');
  }
  switch(item.type) {
    case 'text':
      return item.data;
    case 'directive':
      return;
    case 'comment':
      return '<!--'+item.data+'-->';
    case 'style':
    case 'script':
    case 'tag':
      return '<'+item.name+
               (item.attribs ?
                  Object.keys(item.attribs).reduce(function(prev, key) {
                    return prev + ' '+key+'="'+item.attribs[key]+'"'
                  }, '') : ''
               )+
              '>'+
              (item.children ? html(item.children) : '')+
              (emptyTags[item.name] ? '' : '</'+item.name+'>');
    case 'cdata':
      return;
  }

}

module.exports = html;
