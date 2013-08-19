'use strict';

// auth middleware
module.exports = function(req, req, next){
	var AuthTokenModel = require('../models/auth/token')(app.get('db_server'), app.get('db_collection'));
	var q = require('q');
	var authHeader = req.header('X-NodeWebMailerAuth');
	var authToken = auth_header.split(' ')[1];
	var authModel = new AuthTokenModel({_id: authToken});
	q(authModel.fetch()).then(function(session_data){
		if(session_data.user_id){
			req.user_id = session_data.user_id;
			req.authorized = true;
		} else {
			delete req.user_id;
			req.authorized = false;
		}
		next();
	}, function(err){
		throw err;
	});
}