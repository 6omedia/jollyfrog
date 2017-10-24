const express = require('express');
const formsRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Entry = require('../../models/entry');
const Device = require('../../models/device');
const mid = require('../../middleware/session');
const device = require('device');
const async = require('async');

formsRoutes.get('/:domain', mid.jsonLoginOrApi, function(req, res){

	let body = {};

	let findObj = {'websites.domain': req.params.domain};

	User.find(findObj, {'websites.domain': 1}, function(err, websites){

		if(err){
			res.status(err.status || 500);
			body.error = err;
			return res.json(body);
		}

		if(!websites || websites == ''){
			res.status(404);
			body.error = 'Website not found';
			return res.json(body);
		}

		if(req.session && req.session.userId){
			findObj._id = req.session.userId;
		}else{
			findObj.apikey = req.query.apikey;
		}

		User.find(
			findObj,
			{
				'websites.$.forms': 1
			}, 
		function(err, forms){

			if(err){
				res.status(err.status || 500);
				body.error = err;
				return res.json(body);
			}

			res.status(200);
			body.forms = forms;
			return res.json(body);

		});

	});

});

formsRoutes.get('/:domain/:formId', mid.jsonLoginRequired, function(req, res){

	let body = {};

	User.findOne( 
		{ 
			_id: req.session.userId,
			'websites.domain': req.params.domain
		},
		{
			'websites.$': 1
		},
		function(err, user){

		if(err){
			body.error = err.message || 'Internal Server Error';
			res.status(err.status || 500);
			return res.json(body);
		}

		body.form = user.websites[0].forms.id(req.params.formId);
		res.status(200);
		return res.json(body);

	});

});

formsRoutes.post('/:domain/add', mid.jsonLoginRequired, function(req, res){

	let body = {};

	if(!req.body.name){
		res.status(400);
		body.error = 'Form name required';
		return res.json(body);
	}

	User.find({
		_id: req.session.userId,
		'websites.domain': req.params.domain
	}, {'websites.domain': 1}, function(err, websites){

		if(err){
			res.status(err.status || 500);
			body.error = err;
			return res.json(body);
		}

		if(!websites || websites == ''){
			res.status(404);
			body.error = 'Website not found';
			return res.json(body);
		}

		let form = {
			name: req.body.name,
			submit_id: req.body.submit_id,
			fields: req.body.fields
		}

		console.log('Yeah!!! ', form);

		User.findOneAndUpdate(
			{
				_id: req.session.userId,
				'websites.domain': req.params.domain
			}, 
			{
				$push: {
					'websites.$.forms': form
				}
			},
			{
				new: true
			},
		function(err, user){

			if(err){
				res.status(err.status || 500);
				body.error = err.status || 'Internal Server Error';
				return res.json(body);
			}

			body.success = 'Form Added';
			body.form = user;
			return res.json(body);

		});

	});

});

formsRoutes.post('/update', mid.jsonLoginRequired, function(req, res){

	let body = {};

	return res.json(body);	

});

formsRoutes.delete('/:domain/:formId', mid.jsonLoginRequired, function(req, res){

	let body = {};

	User.update(
		{
			_id: req.session.userId,
			'websites.domain': req.params.domain
		},
		{
			$pull: {
				'websites.$.forms': { _id: req.params.formId}
			}
		},
		function(err, user){

			if(err){
				res.status(err.status || 500);
				body.error = err.status || 'Internal Server Error';
				return res.json(body);
			}

			User.find(
				{
					_id: req.session.userId,
					'websites.domain': req.params.domain
				},
				{
					'websites.$.forms': 1
				},
				function(err, user){

					if(err){
						res.status(err.status || 500);
						body.error = err.status || 'Internal Server Error';
						return res.json(body);
					}

					body.user = user;
					body.success = 'Removed';
					res.status(200);
					return res.json(body);

			});
		}
	);	

});

module.exports = formsRoutes;