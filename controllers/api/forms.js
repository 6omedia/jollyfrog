const express = require('express');
const formsRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const Entry = require('../../models/entry');
const Form = require('../../models/form');
const Website = require('../../models/website');
const Device = require('../../models/device');
const mid = require('../../middleware/session');
const device = require('device');
const async = require('async');

formsRoutes.get('/:domain', mid.jsonLoginOrApi, function(req, res){

	let body = {};

	Website.findOne({ domain: req.params.domain })
		.populate('forms').exec(function(err, website){

			if(err){

				console.log('Err ', err);

				res.status(err.status || 500);
				body.error = err;
				return res.json(body);
			}

			if(!website || website == ''){
				res.status(404);
				body.error = 'Website not found';
				return res.json(body);
			}

			res.status(200);
			body.forms = website.forms;
			return res.json(body);

		});

	// User.find(findObj, {'websites.domain': 1}, function(err, websites){

	// 	if(err){
	// 		res.status(err.status || 500);
	// 		body.error = err;
	// 		return res.json(body);
	// 	}

	// 	if(!websites || websites == ''){
	// 		res.status(404);
	// 		body.error = 'Website not found';
	// 		return res.json(body);
	// 	}

	// 	if(req.session && req.session.userId){
	// 		findObj._id = req.session.userId;
	// 	}else{
	// 		findObj.apikey = req.query.apikey;
	// 	}

	// 	User.find(
	// 		findObj,
	// 		{
	// 			'websites.$.forms': 1
	// 		}, 
	// 	function(err, forms){

	// 		if(err){
	// 			res.status(err.status || 500);
	// 			body.error = err;
	// 			return res.json(body);
	// 		}

	// 		res.status(200);
	// 		body.forms = forms;
	// 		return res.json(body);

	// 	});

	// });

});

formsRoutes.get('/:domain/:formId', mid.jsonLoginRequired, function(req, res){

	let body = {};

	Website.findOne({userId: req.session.userId, domain: req.params.domain})
		.populate('forms')
		.exec(function(err, website){

			if(err){
				body.error = err.message || 'Internal Server Error';
				res.status(err.status || 500);
				return res.json(body);
			}

			body.form = website.forms.id(req.params.formId);
			res.status(200);
			return res.json(body);

		});

});

formsRoutes.post('/:domain/add', mid.jsonLoginRequired, function(req, res){

	let body = {};

	const domain = req.params.domain;

	if(!req.body.name){
		res.status(400);
		body.error = 'Form name required';
		return res.json(body);
	}

	if(!req.body.submit_id){
		res.status(400);
		body.error = 'Submit ID required';
		return res.json(body);
	}

	let theFeilds = [];

	req.body.fields.forEach(function(field){

		theFeilds.push({
			data_point: field.name,
	        input_id: field.field_id,
			required: field.required
		});

	});

	let form = new Form({
		name: req.body.name,
		submit_id: req.body.submit_id,
		fields: theFeilds
	});

	form.save()
		.then(() => {

			Website.findOne({userId: req.session.userId, domain: domain})
				.then((website) => {

					website.forms.push(form);
					website.save()
						.then(() => {

							body.success = 'Form Added';
							body.form = form;
							return res.json(body);

						})
						.catch((err) => {

							console.log('err ', err);

							res.status(err.status || 500);
							body.error = err.message || 'Internal Server Error';
							return res.json(body);

						});

				});

		})
		.catch((err) => {

			res.status(err.status || 500);
			body.error = err.message || 'Internal Server Error';
			return res.json(body);

		});

});

formsRoutes.post('/update', mid.jsonLoginRequired, function(req, res){

	let body = {};

	return res.json(body);

});

formsRoutes.delete('/:domain/:formId', mid.jsonLoginRequired, function(req, res){

	let body = {};

	console.log('HBJBHJHB ', req.params.formId);

	Form.remove({_id: req.params.formId}, function(err, result){

		if(err){
			res.status(err.status || 500);
			body.error = err.status || 'Internal Server Error';
			return res.json(body);
		}

		if(result.result.n > 0){

			Website.findOne({ userId: req.session.userId, domain: req.params.domain })
				.populate('forms')
				.then((website) => {

					body.forms = website.forms;// user;
					body.success = 'Removed';
					res.status(200);
					return res.json(body);

				})
				.catch((err) => {

					res.status(err.status || 500);
					body.error = err.status || 'Internal Server Error';
					return res.json(body);

				});

		}else{

			res.status(500);
			body.error = 'Form could not be removed';
			return res.json(body);

		}

	});

	// Form.removeById(req.params.formId)
	// 	.then((result) => {

	// 		console.log('gmgmgm ', result);

	// 		body.user = user;
	// 		body.success = 'Removed';
	// 		res.status(200);
	// 		return res.json(body);

	// 	})
	// 	.catch((err) => {

	// 		console.log('Err ', err);

	// 		res.status(err.status || 500);
	// 		body.error = err.status || 'Internal Server Error';
	// 		return res.json(body);

	// 	});

	// User.update(
	// 	{
	// 		_id: req.session.userId,
	// 		'websites.domain': req.params.domain
	// 	},
	// 	{
	// 		$pull: {
	// 			'websites.$.forms': { _id: req.params.formId }
	// 		}
	// 	},
	// 	function(err, user){

	// 		if(err){
	// 			res.status(err.status || 500);
	// 			body.error = err.status || 'Internal Server Error';
	// 			return res.json(body);
	// 		}

	// 		User.find(
	// 			{
	// 				_id: req.session.userId,
	// 				'websites.domain': req.params.domain
	// 			},
	// 			{
	// 				'websites.$.forms': 1
	// 			},
	// 			function(err, user){

	// 				if(err){
	// 					res.status(err.status || 500);
	// 					body.error = err.status || 'Internal Server Error';
	// 					return res.json(body);
	// 				}

	// 				body.user = user;
	// 				body.success = 'Removed';
	// 				res.status(200);
	// 				return res.json(body);

	// 		});
	// 	}
	// );	

});

module.exports = formsRoutes;