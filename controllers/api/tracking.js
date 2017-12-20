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
		meta: req.body.meta || {},
		referer: req.body.referer || ''
	}, function(err, entry){

		if(err){
			res.status(err.status || 500);
			data.error = err;
			return res.json(data);
		}

		var deviceObj = {
			fingerprint: req.body.fingerprint,
			type: req.body.type,
			vendor: req.body.vendor,
			os: req.body.os,
			screen: {
				res: req.body.res,
				colorDepth: req.body.colorDepth
			}
		};

		Device.addDeviceIfNew(deviceObj, function(err, device){

			if(err){
				res.status(err.status || 500);
	            data.error = err;
	            return res.json(data);
			}

			res.status(200);
            data.success = 'Successfull Entry';
            return res.json(data);

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

    const dataPoints = req.body.datapoints;

    let foundEmail = null;

    const dateNow = new Date();
    let formEntries = [];

    for(i=0; i<dataPoints.length; i++){

    	let entry = new Entry({
    		userId: user._id,
			ip: ip,
			device: req.body.fingerprint,
			browser: req.body.browser,
			timezone: req.body.timezone,
			language: req.body.language,
			form_name: req.body.form_name,
			date: dateNow,
			domain: req.body.domain,
			data_point: {
				name: dataPoints[i].name,
				value: dataPoints[i].value
			},
			meta: req.body.meta || {},
			referer: req.body.referer || ''
    	});

    	if(dataPoints[i].name == 'email'){
    		foundEmail = dataPoints[i].value;
    	}

    	formEntries.push(entry.save());

    }

    Promise.all(formEntries)
    	.then((a) => {

    		Device.findOne({fingerprint: req.body.fingerprint}, function(err, device){

				if(err){
					res.status(err.status || 500);
					data.error = err;
					return res.json(data);
				}

				if(!device){

					var dObj = {
						fingerprint: req.body.fingerprint,
					    type: req.body.type,
					    vendor: req.body.vendor,
					    os: req.body.os,
					    screen: {
					        res: req.body.screen.res,
					        colorDepth: req.body.colorDepth
					    }
					};

					if(foundEmail){
						dObj.email = foundEmail;
					}

					Device.create(dObj, function(err, device){

						if(err){
							res.status(err.status || 500);
							data.error = err;
							return res.json(data);
						}

						res.status(200);
						data.success = 'Successfull Entry';
						return res.json(data);

					});

				}else{

					if(foundEmail){

						device.email = foundEmail;
						device.save()
							.then(() => {
								res.status(200);
								data.success = 'Successfull Entry';
								return res.json(data);
							})
							.catch((err) => {
								res.status(err.status || 500);
								data.error = err;
								return res.json(data);
							});

					}else{

						res.status(200);
						data.success = 'Successfull Entry';
						return res.json(data);

					}

				}

			});

    	})
    	.catch((err) => {

    		if(err){
				res.status(err.status || 500);
	            data.error = err;
	            return res.json(data);
			}

    	});

});

// trackingRoutes.post('/log_click', mid.apiKeyRequired, function(req, res){

// });

module.exports = trackingRoutes;