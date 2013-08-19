/*
 * nodewebmailer
 * https://github.com/toddself/nodewebmail
 *
 * MIT Licence (see LICENCE for details)
 * Copyright (c) 2013 Todd Kennedy. All rights reserved.
 */

'use strict';

var express = require('express');
var path = require('path');
var parachute = require('parachute');
var build = require('../tools/build');
var buildTests = require('../tools/build-tests');
var authMiddleware = require('../lib/auth_middleware');

exports = module.exports = function (app) {
  app.set('port', process.env.NODE_PORT || 3000);
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(authMiddleware);

  app.use('/app', express.static(path.join(__dirname + '/../app')));
  app.use('/views', express.static(path.join(__dirname + '/../views')));
  app.use('/public', express.static(path.join(__dirname + '/../public')));

  app.get('/bundle.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    build().pipe(res);
  });

  app.get('/test/bundle.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    buildTests().pipe(res);

  });
  app.use(express.favicon());
  app.use(express.logger());
  app.use(app.router);

  app.set('db_server', 'localhost');
  app.set('collection', 'barnstormer');
  app.set('view engine', 'hbs');
  app.set('views', __dirname + '/../views');

  app.configure('unittest', function () {
    app.set('db_server', 'unittests');
  });

  app.configure('development', function () {
    app.use('/test', express.static(path.join(__dirname + '/../test')));
  });
};
