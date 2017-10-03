const express = require('express');
const dashboardRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Entry = require('../../models/entry');
const Device = require('../../models/device');
const mid = require('../../middleware/session');
const device = require('device');
const async = require('async');

dashboardRoutes.post('/generateapikey', mid.jsonLoginRequired, function(req, res){

	let body = {};

	User.genApiKey(req.session.userId, function(err, apiKey){

		if(err){
			res.status(err.status || 500);
			body.error = err.message || 'something went wrong';
			return res.json(body);
		}

		res.status(200);
		body.success = 'new key generated';
		body.apiKey = apiKey;
		return res.json(body);

	});

});

module.exports = dashboardRoutes;