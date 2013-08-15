#!/usr/bin/node

'use strict';

var path = require('path');
var fs = require('fs');
var build = require('./build');
var bundlePath = path.join(__dirname, '..', 'test', 'bundle.js');

var buildTests = module.exports = function () {
  return build({
    entry: require.resolve('../test/run'),
  });
};

buildTests.write = function (cb) {
  cb = cb || function () {};
  buildTests()
    .on('end', cb)
    .pipe(fs.createWriteStream(bundlePath));
};

buildTests.bundlePath = bundlePath;

if (module === require.main)
  buildTests.write();
