#!/usr/bin/env node

'use strict';

var fs = require('fs');

fs.symlink('node_modules/cheerio', 'node_modules/jquery', 'file', function (err) {
  if (err) {
    throw new Error(err);
  }
});
