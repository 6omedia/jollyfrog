const express = require('express');
const trackingRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Entry = require('../../models/entry');
const Device = require('../../models/device');
const mid = require('../../middleware/session');
const device = require('device');
const async = require('async');

trackingRoutes.post('/log_page_view', mid.apiKeyRequired, function(req, res){

	let data = {};

	if(!req.body.url || !req.body.domain){
		res.status(400);
		data.error = {
			message: 'Invalid data',
			status: 400
		};
		return res.json(data);
	}

	if(!req.session.logged){
		req.session.logged = true;	
	}

	const user = res.locals.user;

	const ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

	Entry.create({
		userId: user._id,
		ip: ip,
		device: req.body.fingerprint,
		browser: req.body.browser,
		timezone: req.body.timezone,
	    language: req.body.language,
		date: new Date(),
		domain: req.body.domain,
		data_point: {
			name: 'page view',
			value: req.body.url
		},
		meta: req.body.meta || {}
	}, function(err, entry){

		if(err){
			res.status(err.status || 500);
			data.error = err;
			return res.json(data);
		}

		Device.findOne({fingerprint: req.body.fingerprint}, function(err, device){

			if(err){
				res.status(err.status || 500);
				data.error = err;
				return res.json(data);
			}

			if(!device){

				Device.create({
					fingerprint: req.body.fingerprint,
				    type: req.body.type,
				    vendor: req.body.vendor,
				    os: req.body.os,
				    screen: {
				        res: req.body.screen.res,
				        colorDepth: req.body.colorDepth
				    }
				}, function(err, device){

					if(err){
						res.status(err.status || 500);
						data.error = err;
						return res.json(data);
					}

					res.status(200);
					data.success = 'Successfull Entry';
					return res.json(data);

				});

			}

		});

	});

});

trackingRoutes.post('/log_formsubmission', mid.apiKeyRequired, function(req, res){

	let data = {};

	if(!req.body.form_name || !req.body.domain){
		res.status(400);
		data.error = {
			message: 'Invalid data',
			status: 400
		};
		return res.json(data);
	}

	if(!req.session.logged){
		req.session.logged = true;	
	}

	const user = res.locals.user;

	const ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

    const dataPoints = JSON.parse(req.body.datapoints);

    async.each(dataPoints, function(dataPoint, callback){

    	Entry.create({
			userId: user._id,
			ip: ip,
			device: req.body.fingerprint,
			browser: req.body.browser,
			timezone: req.body.timezone,
			language: req.body.language,
			date: new Date(),
			domain: req.body.domain,
			data_point: {
				name: dataPoint.name,
				value: dataPoint.value
			},
			meta: {
				form: req.body.form_name
			}
		}, function(err, entry){

			if(err){
				res.status(err.status || 500);
				data.error = err;
				return res.json(data);
			}

			Device.findOne({fingerprint: req.body.fingerprint}, function(err, device){

				if(err){
					res.status(err.status || 500);
					data.error = err;
					return res.json(data);
				}

				if(!device){

					Device.create({
						fingerprint: req.body.fingerprint,
					    type: req.body.type,
					    vendor: req.body.vendor,
					    os: req.body.os,
					    screen: {
					        res: req.body.screen.res,
					        colorDepth: req.body.colorDepth
					    }
					}, function(err, device){

						if(err){
							res.status(err.status || 500);
							data.error = err;
							return res.json(data);
						}

						callback();

						res.status(200);
						data.success = 'Successfull Entry';
						return res.json(data);

					});

				}else{
					callback();
				}

			});

		});

    });

    res.status(200);
	data.success = 'Successfull Entry';
	return res.json(data);

});

trackingRoutes.post('/log_click', mid.apiKeyRequired, function(req, res){

});

module.exports = trackingRoutes;