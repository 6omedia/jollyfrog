process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();
let expect = chai.expect();

chai.use(chaiHttp);

var agent = chai.request.agent(server);

function logBillyIn(callback){

    agent
        .post('/')
        .send({ email: 'bill@billy.com', password: '123', test: true})
        .end(function (err, res) {

            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

function logGeorgeAdminIn(callback){

    agent
        .post('/')
        .send({ email: 'george@georgy.com', password: '456', test: true, admin: true})
        .end(function (err, res) {

            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

describe('websites routes', () => {

    // before these tests, delete all users, and create one user

    before(function(done){
        User.remove({}, function(err){
            User.registerUser({
                name: 'Bill',
                email: 'bill@billy.com',
                password: '123',
                confirm_password: '123',
                admin: false,
                meta: {
                  age: 22,
                  website: 'www.billy.com'
                }
            }, function(err, user){

                if(!err){

                    User.registerUser({
                        name: 'Franky',
                        email: 'frank@franky.com',
                        password: 'abc',
                        confirm_password: 'abc',
                        admin: false,
                        meta: {
                          age: 22,
                          website: 'www.franky.com'
                        }
                    }, function(err, user){

                        if(!err){

                            User.registerUser({
                                name: 'George',
                                email: 'george@georgy.com',
                                password: '456',
                                confirm_password: '456',
                                admin: true,
                                meta: {
                                  age: 22,
                                  website: 'www.george.com'
                                }
                            }, function(err, user){

                                if(!err){
                                    done();
                                }
                            
                            });
                            
                        }
                    
                    });

                }
            
            });

        });
    });

    describe('/GET websites', () => {

        it('user not logged in so redirect to home page', (done) => {



        });

        it('user is logged in so render websites page', (done) => {



        });

    });

    describe('/GET websites', () => {

        it('user not logged in so redirect to home page', (done) => {



        });

        it('user is logged in so render websites page', (done) => {



        });

    });

});