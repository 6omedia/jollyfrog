const express = require('express');
const blockedDevicesRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Entry = require('../../models/entry');
const Device = require('../../models/device');
const ExcludedDevice = require('../../models/excluded_device');
const mid = require('../../middleware/session');
const device = require('device');
const async = require('async');

blockedDevicesRoutes.get('/', mid.jsonLoginRequired, function(req, res){

	let body = {};

	ExcludedDevice.find({userId: req.session.userId}, function(err, exDevices){

		if(err){
			body.error = err.message || 'Some sort of error...';
			res.status(err.status || 500);
			return res.json(body);
		}

		res.status(200);
		body.devices = exDevices;
		return res.json(body);

	});

});

blockedDevicesRoutes.post('/add', mid.jsonLoginRequired, function(req, res){

	let body = {};

	if(!req.body.device_name || !req.body.fingerprint){
		body.error = 'Missing Information';
		res.status(400);
		return res.json(body);
	}

	ExcludedDevice.create({
		userId: req.session.userId,
		fingerprint: req.body.fingerprint,
		device_name: req.body.device_name 
	}, function(err, exDevice){

		if(err){
			if(err.code === 11000){
				body.error = err.message || 'Device is allready blocked...';
				res.status(409);
				return res.json(body);
			}
			body.error = err.message || 'Some sort of error...';
			res.status(err.status || 500);
			return res.json(body);
		}		

		res.status(200);
		body.success = 'Added';
		return res.send(body);

	});

});

blockedDevicesRoutes.delete('/:fingerprint', mid.jsonLoginRequired, function(req, res){

	let body = {};

	ExcludedDevice.remove({userId: req.session.userId, fingerprint: req.params.fingerprint}, function(err, exDevice){

		if(err){
			body.error = err.message || 'Some sort of error...';
			res.status(err.status || 500);
			return res.json(body);
		}	

		res.status(200);
		body.success = 'Device no longer blocked';
		return res.send(body);

	});

});

blockedDevicesRoutes.get('/:fingerprint', mid.jsonLoginRequired, function(req, res){

	let body = {};

	ExcludedDevice.findOne({userId: req.session.userId, fingerprint: req.params.fingerprint}, function(err, device){

		if(err){
			body.error = err.message || 'Some sort of error...';
			res.status(err.status || 500);
			return res.json(body);
		}

		res.status(200);
		body.device = device;
		return res.send(body);

	});

});

module.exports = blockedDevicesRoutes;