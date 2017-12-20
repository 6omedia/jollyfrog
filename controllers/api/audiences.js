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

	var audience = new Audience({
		userId: req.session.userId,
		name: req.body.name,
        domains: req.body.domains,
        browser: req.body.browsers,
        category: req.body.cats,
        funnel_position: req.body.funnel_position
	});

	audience.save()
		.then(() => {

			Audience.find({userId: req.session.userId}, function(err, audiences){

				if(err){
					body.error = err.message || 'Internal Server Error';
					res.status(500);
					return res.json(body);
				}

				body.audiences = audiences;
				res.status(200);
				return res.json(body);

			});

		})
		.catch((err) => {

			body.error = err.message || 'Internal Server Error';
			res.status(500);
			return res.json(body);

		});

});

audienceRoutes.post('/update', mid.jsonLoginOrApi, function(req, res){

	let body = {};

	if(!req.body.name){
		body.error = 'Name Required';
		res.status(400);
		return res.json(body);
	}

	Audience.findById(req.body.audienceid, function(err, audience){

		if(err){
			body.error = err.message || 'Internal Server Error';
			res.status(500);
			return res.json(body);
		}

		audience.name = req.body.name,
 		audience.domains = req.body.domains,
 		audience.browser = req.body.browsers,
	 	audience.category = req.body.cats,
 		audience.funnel_position = req.body.funnel_position

 		audience.save()
 			.then((audience) => {

 				Audience.find({userId: req.session.userId}, function(err, audiences){

 					if(err){
						body.error = err.message || 'Internal Server Error';
						res.status(500);
						return res.json(body);
					}

 					body.audiences = audiences;
 					body.success = 'Audience Updated';
					res.status(200);
					return res.json(body);

 				});

 			})
 			.catch((err) => {

 				body.error = err.message || 'Internal Server Error';
				res.status(500);
				return res.json(body);

 			});

	});

	// var audience = new Audience({
	// 	userId: req.session.userId,
	// 	name: req.body.name,
 //        domains: req.body.domains,
 //        browser: req.body.browsers,
 //        category: req.body.cats,
 //        funnel_position: req.body.funnel_position
	// });

	// audience.save()
	// 	.then(() => {

	// 		Audience.find({userId: req.session.userId}, function(err, audiences){

	// 			if(err){
	// 				body.error = err.message || 'Internal Server Error';
	// 				res.status(500);
	// 				return res.json(body);
	// 			}

	// 			body.audiences = audiences;
	// 			res.status(200);
	// 			return res.json(body);

	// 		});

	// 	})
	// 	.catch((err) => {

	// 		body.error = err.message || 'Internal Server Error';
	// 		res.status(500);
	// 		return res.json(body);

	// 	});

});

audienceRoutes.delete('/:id', mid.jsonLoginOrApi, function(req, res){

	let body = {};
	var id = req.params.id;

	Audience.remove({_id: id}, function(err){

		if(err){
			body.error = err.message || 'Internal Server Error';
			res.status(500);
			return res.json(body);
		}

		Audience.find({ userId: req.session.userId }, function(err, audiences){

			if(err){
				body.error = err.message || 'Internal Server Error';
				res.status(500);
				return res.json(body);
			}	

			body.audiences = audiences;
			body.success = 'Audience Removed';
			res.status(200);
			return res.json(body);

		});

	});

});

audienceRoutes.get('/', mid.jsonLoginOrApi, function(){



});

module.exports = audienceRoutes;