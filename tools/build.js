#!/usr/bin/node

'use strict';

var browserify = require('browserify');
var shim = require('browserify-shim');
var path = require('path');
var fs = require('fs');
var extend = require('util')._extend;
var bundlePath = path.join(__dirname, '..', 'bundle.js');

var defaultShims = {
  jquery: {
    path: require.resolve('../components/jquery/jquery'),
    exports: '$'
  },
  bootstrap: {
    path: require.resolve('../components/bootstrap/js/bootstrap'),
    exports: null, // just require it in order to make it attach itself at jQuery.fn.modal
    depends: {
      jquery: '$'
    }
  }
};

var build = module.exports = function (opts) {
  opts = opts || {};
  var entry = opts.entry || require.resolve('../app/main');
  var shims = extend(defaultShims, (opts.shims || {}));

  return shim(browserify(), shims)
    .transform('hbsfy')
    .require(entry, {
      entry: true
    })
    .bundle({
      debug: true
    });
};

if (module === require.main)
  build().pipe(fs.createWriteStream(bundlePath));
