// let mongoose = require('mongoose');
// let User = require('../models/user');

// function getProfile(req, res){

    

// }

// function getRegisterPage(req, res){

//     // middleware
//     var loggedIn = false;

//     if(loggedIn){
//         return res.redirect('/profile');
//     }

//     res.render('register', {
//         error: ''
//     });

// }

// function registerUser(req, res, next){

//     var userObj = {
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password,
//         confirm_password: req.body.confirm_password
//     };

//     User.registerUser(userObj, function(err, user){

//         var error = '';

//         if(err){
//             res.status(400);
//             return res.render('register', {
//                 error: err
//             });
//         }

//         // login and start session
//         req.session.userId = user._id;
//         return res.redirect('/profile');

//     });

// }

// //export all the functions
// module.exports = { getProfile, getRegisterPage, registerUser };