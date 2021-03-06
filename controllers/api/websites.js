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

			User.findByIdAndUpdate(
				req.session.userId,
				{
					$push: {
						websites: website
					}
				},
				{ new: true },
				function(err, user){

					if(err){
						res.status(err.status || 500);
						body.error = 'Some error';
						return res.json(body);
					}

					user.populate('websites', function(err){

						if(err){
							res.status(err.status || 500);
							body.error = 'Some error';
							return res.json(body);
						}

						body.websites = user.websites;

						console.log('Websites ', body.websites);

						body.success = 'Website Created';

						res.status(200);
						return res.json(body);

					});	

				}
			);

			// user.websites.push(website);
			// user.save(function(err, user){

			// 	if(err){
			// 		res.status(err.status || 500);
			// 		body.error = 'Some error';
			// 		return res.json(body);
			// 	}

			// 	user.populate('websites', function(err){

			// 		if(err){
			// 			res.status(err.status || 500);
			// 			body.error = 'Some error';
			// 			return res.json(body);
			// 		}

			// 		body.websites = user.websites;
			// 		body.success = 'Website Created';

			// 		res.status(200);
			// 		return res.json(body);

			// 	});

			// });

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

websitesRoutes.delete('/:website_id', mid.jsonLoginRequired, function(req, res){

	let body = {};
	const website_id = req.params.website_id;

	Website.remove({userId: req.session.userId, _id: website_id}, function(err, removed){

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
				websites: website_id
			}
		}, function(err, user){

			if(err){
				res.status(err.status || 500);
				body.error = err.message;
				return res.json(body);
			}

			user.populate('websites', function(err){

				if(err){
					res.status(err.status || 500);
					body.error = err.message;
					return res.json(body);
				}

				body.success = 'Domain Updated';
				body.websites = user.websites;
				res.status(200);
				return res.json(body);

			});

		});

	});

});

websitesRoutes.get('/:domain/stats', mid.jsonLoginRequired, function(req, res){

	let body = {};
	const domain = req.params.domain;

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

module.exports = websitesRoutes;