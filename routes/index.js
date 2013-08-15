/*
 * nodewebmailer
 * https://github.com/toddself/nodewebmail
 *
 * MIT Licence (see LICENCE for details)
 * Copyright (c) 2013 Todd Kennedy. All rights reserved.
 */

'use strict';

// page controllers
var MailboxController = require('../controllers/mailbox');
var SettingsController = require('../controllers/settings');

// rest controllers
var IMAPRESTController = require('../controllers/rest/imap');
var SMTPRESTController = require('../controllers/rest/smtp');
var SettingsRESTController = require('../controllers/rest/settings');
var AuthRestController = require('../controllers/rest/auth');

module.exports = function(app){
    var mailbox = new MailboxController({app: app});
    var settings = new SettingsController({app: app, auth: true});

    var imap = new IMAPRESTController({app: app, auth: true});
    var stmp = new SMTPRESTController({app: app, auth: true});
    var settings_rest = new SettingsRESTController({app: app, auth: true});
    var auth_rest = new AuthRestController({app: app});

    // main app
    app.get('/', mailbox.route());
    app.get('/mail/:mailbox', mailbox.route());
    app.get('/mail/:mailbox/:mail_id', mailbox.route());

    // settings screens
    app.get('/settings', settings.route());

    // auth interface
    app.post('/login', auth_rest.route());

    // settings rest interface
    app.all('/api/settings', settings_rest.route());

    // mail rest interface
    // POST and PUT implement DRAFT storage and update, sending is done via SMTP
    app.get('/api/mail', imap.route());
    app.get('/api/mail/:user/:mail_id', imap.route());
    app.post('/api/mail', imap.route());
    app.delete('/api/mail/:user/:mail_id', imap.route());
    app.put('/api/mail/:user/:mail_id', imap.route());

    // smtp rest interface
    app.post('/api/send', smtp.route());
};