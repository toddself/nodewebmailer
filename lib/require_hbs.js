'use strict';

var fs = require('fs');

require.extensions['.hbs'] = function (module, filename) {
  var handlebars = require('handlebars');
  var data = fs.readFileSync(filename, 'utf8');
  var tmpl = handlebars.precompile(data);
  module.exports = handlebars.template(tmpl.toString());
};
