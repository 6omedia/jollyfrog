const express = require('express');
const adminRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Entry = require('../models/entry');
const Device = require('../models/device');
const mid = require('../middleware/session');
const moment = require('moment');

adminRoutes.get('/', mid.loginRequired, function(req, res, next){

	Entry.find({'data_point.name': 'page view'}).sort({date:-1}).limit(20).exec(function(err, pageViews){

		if(err){
			res.status(err.status || 500);
			return next(err);
		}

		pageViews.forEach(function(element){
			element.date_formatted = moment(element.date).format('DD/MM/YYYY');
		});

		Entry.find({'data_point.name': 'email'}, function(err, emails){

			if(err){
				res.status(err.status || 500);
				return next(err);
			}

			emails.forEach(function(element){
				element.date_formatted = moment(element.date).format('DD/MM/YYYY');
			});

			Device.find({}, function(err, devices){

				if(err){
					res.status(err.status || 500);
					return next(err);
				}

				res.render('admin/admin', {
					pageViews: pageViews,
					emails: emails,
					devices: devices,
					error: ''
				});

			});

		});

	});

});

adminRoutes.get('/websites', mid.loginRequired, function(req, res, next){

	 User.findById(req.session.userId, function(err, user){

        if(err){
            return next(err);
        }

		res.render('admin/websites', {
			user: user,
			websites: user.websites || [],
			error: ''
		});

	});

});

module.exports = adminRoutes;