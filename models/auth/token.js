'use strict';

module.exports = function(server, collection){
	var SharedModel = require('mongosync')(server, collection);
	var Moment = require('moment');
	var timeFormat = require('../../lib/time_format');

	var AuthTokenModel = SharedModel.extend({
		defaults: {
			user_id: '',
			expires: (new Moment()).format(timeFormat),
			sessionIP: ''
		}
	});

	return AuthTokenModel;
}