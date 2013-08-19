'use strict';

var q = require('q');
var MailboxController = require('../lib/base_controller').createRoute();
var MainView = require('../views/main');

MailboxController.prototype.get = function (req, res, next) {
  if(req.authorized){
    var mainview = new MainView();
    mainview.setUser(req.user_id);
    res.send(200, mainview.render());
  } else {
    res.redirect('/login');
  }

};

module.exports = MailboxController;