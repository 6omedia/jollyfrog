const express = require('express');
const audienceRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Entry = require('../models/entry');
const Audience = require('../models/audience');
const Website = require('../models/website');
const ExcludedDevice = require('../models/excluded_device');
const mid = require('../middleware/session');
const helpers = require('../helpers/helpers');
const http = require('http');

audienceRoutes.get('/', mid.loginRequired, function(req, res, next){

	User.findById(req.session.userId).populate('websites').exec(function(err, user){

        if(err){
            return next(err);
        }

        Audience.find({ userId: req.session.userId }, function(err, audiences){

            if(err){
                return next(err);
            }            

            if(req.query.id){
                Audience.findById(req.query.id, function(err, audience){

                    if(err){
                        return next(err);
                    }

                    audience.generate('', '', req.session.userId, function(err, emails){

                        if(err){
                            return next(err);
                        }

                        return res.render('audiences/audiences', {
                            id: user._id,
                            name: user.name,
                            user: user,
                            current: 'audiences',
                            websites_left: user.websites,
                            audiences: audiences,
                            audience: audience,
                            emails: emails
                        });

                    });

                });
            }else{

                return res.render('audiences/audiences', {
                    id: user._id,
                    name: user.name,
                    user: user,
                    current: 'audiences',
                    websites_left: user.websites,
                    audiences: audiences
                });

            }

        });

    });

});

audienceRoutes.get('/new', mid.loginRequired, function(req, res){

    User.findById(req.session.userId).populate('websites').exec(function(err, user){

        if(err){
            return next(err);
        }

        Audience.find({ userId: req.session.userId }, function(err, audiences){

            if(err){
                return next(err);
            }            

            return res.render('audiences/editor', {
                id: user._id,
                name: user.name,
                user: user,
                current: 'audiences',
                websites: user.websites,
                audiences: audiences
            });

        });

    });

});

audienceRoutes.get('/edit/:id', mid.loginRequired, function(req, res){

    User.findById(req.session.userId).populate('websites').exec(function(err, user){

        if(err){
            return next(err);
        }

        Audience.find({ userId: req.session.userId }, function(err, audiences){

            if(err){
                return next(err);
            }

            Audience.findById(req.params.id, function(err, audience){

                if(err){
                    return next(err);
                }

                var catsString = '';

                for(var i=0; i<audience.category.length; i++){

                    catsString += audience.category[i];
                    if(i < audience.category.length - 1){
                        catsString += ',';
                    }

                }

                return res.render('audiences/editor', {
                    id: user._id,
                    name: user.name,
                    user: user,
                    current: 'audiences',
                    websites: user.websites,
                    audiences: audiences,
                    audience: audience,
                    catsString: catsString,
                    mode: 'edit',
                    browsers: ['Internet Explorer', 'Chrome', 'Safari', 'Fire Fox']
                });

            });

        });

    });

});

module.exports = audienceRoutes;