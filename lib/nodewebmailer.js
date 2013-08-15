/*
 * nodewebmailer
 * https://github.com/toddself/nodewebmail
 *
 * MIT Licence (see LICENCE for details)
 * Copyright (c) 2013 Todd Kennedy. All rights reserved.
 */

'use strict';

var app = require('express')();
require('../config')(app);
require('../routes')(app);

app.listen(app.get('port'));

module.exports = app;