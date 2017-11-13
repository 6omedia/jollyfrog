const express = require('express');
const websitesRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Entry = require('../../models/entry');
const Device = require('../../models/device');
const Website = require('../../models/website');
const mid = require('../../middleware/session');
const device = require('device');
const async = require('async');

websitesRoutes.post('/add', mid.jsonLoginRequired, function(req, res){

	let body = {};

	if(!req.body.name){
		res.status(400);
		body.error = 'Website name required';
		return res.json(body);
	}

	if(!req.body.domain){
		res.status(400);
		body.error = 'Website domain required';
		return res.json(body);
	}

	User.findById(req.session.userId, function(err, user){

		if(err){
			res.status(err.status || 500);
			body.error = 'Some error';
			return res.json(body);
		}

		// const website = new Website({
		// 	userId: user._id,
		// 	name: req.body.name,
	 //        domain: req.body.domain,
		//     forms: req.body.forms || [],
	 //        campaigns: req.body.campaigns || []
		// });

		Website.create({
			userId: user._id,
			name: req.body.name,
	        domain: req.body.domain,
		    forms: req.body.forms || [],
	        campaigns: req.body.campaigns || []
		}, function(err, website){

			if(err){
				if(err.code === 11000){
					res.status(409);
					body.error = 'A website with that domain already exists';
					return res.json(body);
				}
				res.status(err.status || 500);
				body.error = 'Some error';
				return res.json(body);
			}

			user.websites.push(website);
			user.save(function(err, user){

				if(err){
					res.status(err.status || 500);
					body.error = 'Some error';
					return res.json(body);
				}

				body.websites = user.websites;
				body.success = 'Website Created';

				res.status(200);
				return res.json(body);

			});

		});

	});

});

websitesRoutes.post('/edit/:domain', mid.jsonLoginRequired, function(req, res){

	let body = {};
	const domain = req.params.domain;

	Website.findOneAndUpdate({domain: domain, userId: req.session.userId},
		{
			$set: {
				name: req.body.name,
	        	domain: req.body.domain
			}
		}, function(err, website){

		if(err){
			res.status(err.status || 500);
			body.error = err.message;
			return res.json(body);
		}
	
		if(!website){
			res.status(404);
			body.error = 'Domain not found';
			return res.json(body);
		}
	
		body.success = 'Domain Updated';
		res.status(200);
		return res.json(body);

	});

});

websitesRoutes.delete('/:domain', mid.jsonLoginRequired, function(req, res){

	let body = {};
	const domain = req.params.domain;

	Website.remove({userId: req.session.userId, domain: domain}, function(err, removed){

		if(err){
			res.status(err.status || 500);
			body.error = err.message;
			return res.json(body);
		}

		if(removed.result.n === 0){
			res.status(404);
			body.error = 'Domain not found';
			return res.json(body);
		}

		User.findOneAndUpdate({_id: req.session.userId},
		{
			$pull: {
				websites: {
					domain: domain
				}
			}
		}, function(err, user){

			if(err){
				res.status(err.status || 500);
				body.error = err.message;
				return res.json(body);
			}

			body.success = 'Domain Updated';
			res.status(200);
			return res.json(body);

		});

	});



	// User.update({_id: req.session.userId, 'websites.domain': domain},
	// {
	// 	$pull: {
	// 		websites: {domain: domain}
	// 	}
	// }, function(err, affected){

	// 	if(err){
	// 		res.status(err.status || 500);
	// 		body.error = err.message;
	// 		return res.json(body);
	// 	}

	// 	if(affected.nModified < 1){
	// 		res.status(404);
	// 		body.error = 'Domain not found';
	// 		return res.json(body);
	// 	}

	// 	User.findById(req.session.userId, function(err, user){

	// 		if(err){
	// 			res.status(err.status || 500);
	// 			body.error = err.message;
	// 			return res.json(body);
	// 		}

	// 		body.websites = user.websites;
	// 		res.status(200);
	// 		return res.json(body);

	// 	});

	// });

});

websitesRoutes.get('/:domain/stats', mid.jsonLoginRequired, function(req, res){

	let body = {};
	const domain = req.params.domain;

	User.findById(req.session.userId, function(err, user){

		if(err){
			res.status(err.status || 500);
			body.error = err.message;
			return res.json(body);
		}

		if(user.websites){
		
			let found = false;

			for(i=0; i<user.websites.length; i++){

				let website = user.websites[i];
				if(website.domain == domain){
					found = true;
				}

			}

			if(!found){
				res.status(404);
				body.error = 'after loop - Domain not found for user';
				return res.json(body);
			}

		}else{
			res.status(404);
			body.error = 'no user websites - Domain not found for user';
			return res.json(body);
		}

		let fp = '';

		if(req.query.funnelposition){
			fp = req.query.funnelposition;
		}

		Entry.getPageViews(req.session.userId, domain, 'from', 'to', fp, function(err, pageviews){

			if(err){
				res.status(err.status || 500);
				body.error = err.message;
				return res.json(body);
			}

			Entry.getDevices(req.session.userId, domain, 'from', 'to', fp, function(err, devices){

				if(err){
					res.status(err.status || 500);
					body.error = err.message;
					return res.json(body);
				}

				res.status(200);
				body.page_views = pageviews;
				body.unique_devices = devices;
				return res.json(body);

			});

		});

	});

});

module.exports = websitesRoutes;