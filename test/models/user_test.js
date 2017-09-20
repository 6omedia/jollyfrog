process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();

chai.use(chaiHttp);

describe('User Model', () => {

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
                    done();
                }
            });
        });
    });

 	describe('registerUser', () => {

        it('created user should have a hased password, not the original', (done) => {
            
        	var userObj = {
		        name: 'bob',
		        email: 'bob@bobby.com',
		        password: '123',
        		confirm_password: '123'
		    };

        	User.registerUser(userObj, function(err, user){

		        user.password.should.not.equal('');
		        user.password.should.not.equal(userObj.password);
		        done();

		    });

        });

    });

    describe('authenticate', () => {

        it('should have no error', (done) => {
            
        	User.authenticate('bill@billy.com', '123', function(err, user){
        		should.not.exist(err);
                done();
        	});

        });

        it('should have a user', (done) => {
            
        	User.authenticate('bill@billy.com', '123', function(err, user){
        		user.should.have.property('_id');
                done();
        	});

        });

        it('should return error', (done) => {
            
        	User.authenticate('bill@billy.com', 'hjkhjk', function(err, user){
        		should.exist(err);
        	    done();
            });

        });

    });

});