const express = require('express');
const audienceRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Entry = require('../../models/entry');
const Form = require('../../models/form');
const Website = require('../../models/website');
const Device = require('../../models/device');
const Audience = require('../../models/audience');
const mid = require('../../middleware/session');
const device = require('device');
const async = require('async');

audienceRoutes.post('/add', mid.jsonLoginOrApi, function(req, res){

	let body = {};

	if(!req.body.name){
		body.error = 'Name Required';
		res.status(400);
		return res.json(body);
	}

	// Audience.

});

module.exports = audienceRoutes;