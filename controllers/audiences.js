const express = require('express');
const audienceRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Entry = require('../models/entry');
const Website = require('../models/website');
const ExcludedDevice = require('../models/excluded_device');
const mid = require('../middleware/session');
const helpers = require('../helpers/helpers');
const http = require('http');

audienceRoutes.get('/', mid.loginRequired, function(req, res){

	User.findById(req.session.userId).populate('websites').exec(function(err, user){

        if(err){
            return next(err);
        }

    	return res.render('audiences/audiences', {
        	id: user._id,
            name: user.name,
            user: user,
            current: 'audiences',
            websites_left: user.websites
        });

    });

});

audienceRoutes.get('/new', mid.loginRequired, function(req, res){

    User.findById(req.session.userId).populate('websites').exec(function(err, user){

        if(err){
            return next(err);
        }

        return res.render('audiences/add', {
            id: user._id,
            name: user.name,
            user: user,
            current: 'audiences',
            websites: user.websites
        });

    });

});

module.exports = audienceRoutes;