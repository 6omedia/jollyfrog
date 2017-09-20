const User = require('../models/user');

// redered rounte

function loggedIn(req, res, next) {

    if(req.session && req.session.userId) {

        User.findById(req.session.userId, function(err, user){
            if(user.admin){
                return res.redirect('/admin');

            }else{
                return res.redirect('/profile');
            }
            return next();
        });

    }else{
        return next();
    }

}

function loginRequired(req, res, next) {
    if(req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/');
}

// json routes

// function jsonLoginInAdmin(req, res, next){
    
// }

function jsonLoginRequired(req, res, next){
    if(req.session && req.session.userId) {
        return next();
    }
    res.status(403);
    return res.json({error: 'unauthorized'});
}

function apiKeyRequired(req, res, next){

    if(!req.body.apikey){
        res.status(400);
        return res.json({
            error: {
                message: 'No API Key',
                status: 400
            }
        });
    }

    User.findOne({apikey: req.body.apikey}, function(err, user){

        if(err){
            return next(err);
        }

        // console.log('apikey ', req.body.apikey);
        // console.log('user ', user);

        if(!user){
            res.status(403);
            return res.json({
                error: {
                    message: 'Incorrect API Key',
                    status: 403
                }
            });
        }

        res.locals.user = user;
        return next();

    });

}

module.exports.loggedIn = loggedIn;
module.exports.loginRequired = loginRequired;
module.exports.jsonLoginRequired = jsonLoginRequired;
module.exports.apiKeyRequired = apiKeyRequired;