/*
 * nodewebmailer
 * https://github.com/toddself/nodewebmail
 *
 * MIT Licence (see LICENCE for details)
 * Copyright (c) 2013 Todd Kennedy. All rights reserved.
 */

'use strict';

module.exports = function(server, collection){
    var SharedModel = require('mongosync')(server, collection);

    var User = SharedModel.extend({
        defaults: {
            first: '',
            last: '',
            email: '',
            password: ''
        }
    });

};