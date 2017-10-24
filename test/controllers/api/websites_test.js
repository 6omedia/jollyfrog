process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Entry = require('../../../models/entry');
let Device = require('../../../models/device');
// let Website = require('../../../models/website');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

var agent = chai.request.agent(server);

function logMarkIn(callback){

    agent
        .post('/')
        .send({ email: 'mark@mark.com', password: '123', test: true})
        .end(function (err, res) {

            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

describe('website api routes', () => {

	let theUserId = '';

	before(function(done){
		User.remove({}, function(){
			User.create({
	            name: 'Mark',
	            email: 'mark@mark.com',
	            password: '123',
	            apikey: 'fuckyeahapi'
	        }, function(err, user){
	        	if(err){
	        		console.log(err);
	        	}
	        	theUserId = user._id;
	        	done();
	        });
		});
	});

	describe('POST /add', () => {

		afterEach(function(done){
			User.update({'email': 'mark@mark.com'}, {
				$set: {
					websites: []
				}
			}, function(err, affectedObj){
					
				done();
				
			});
		});

		it('should return 401 as no one is logged in', (done) => {

			chai.request(server)
                .post('/api/websites/add')
                .send({
                	name: 'Things',
                	domain: 'things.com'
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should return 400 as name is missing', (done) => {
			
			logMarkIn(function(agent){

				agent.post('/api/websites/add')
	                .send({
	                	name: '',
	                	domain: 'things.com'
	                })
	                .end((err, res) => {
	                    res.should.have.status(400);
	                    done();
	                });

			});

		});

		it('should return 400 as domain is missing', (done) => {
			
			logMarkIn(function(agent){

				agent.post('/api/websites/add')
	                .send({
	                	name: 'Things',
	                	domain: ''
	                })
	                .end((err, res) => {
	                    res.should.have.status(400);
	                    done();
	                });

			});

		});

		it('should return 409 as website already exists with that domain', (done) => {
			
			User.findOneAndUpdate({email: 'mark@mark.com'}, {
				$push: {
					websites: {
	                	name: 'hmmm',
						domain: 'yeah.co.uk'
	                }
				}
			}, {new: true}, function(err, user){
				if(!err){
					
					logMarkIn(function(agent){

						agent.post('/api/websites/add')
			                .send({
			                	name: 'hmmm',
								domain: 'yeah.co.uk'
			                })
			                .end((err, res) => {
			                    res.should.have.status(409);
			                    res.body.error.should.equal('Domain already exists');
			                    done();
			                }); 

					});

				}
				else{
					console.log(err);
				}
			});

		});

		it('should add website things.com to the user', (done) => {
			
			logMarkIn(function(agent){

				agent.post('/api/websites/add')
	                .send({
	                	name: 'Things',
	                	domain: 'things.com'
	                })
	                .end((err, res) => {
	                    User.findOne({email: 'mark@mark.com'}, function(err, user){
	                    	// console.log('HERE ', user);
	                    	user.websites[0].name.should.equal('Things');
	                    	done();
	                    });
	                });

			});

		});

	});

	describe('POST /edit/:domain', () => {

		beforeEach(function(done){
			User.findOneAndUpdate({email: 'mark@mark.com'}, {
				$push: {
					websites: {
						name: 'yeah',
						domain: 'yeah.co.uk'
					}
				}
			}, {new: true}, function(err, user){
				if(!err){
					done();
				}
				else{
					console.log(err);
				}
			});
		});

		afterEach(function(done){
			User.update({'email': 'mark@mark.com'}, {
				$set: {
					websites: []
				}
			}, function(err, affectedObj){
				
				done();
				
			});
		});

		it('should return 401 as no one is logged in', (done) => {

			chai.request(server)
                .post('/api/websites/edit/hmmm.com')
                .send({
                	name: 'Things',
                	domain: 'things.com'
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should return 404 as domain dosent exist for that user', (done) => {

			logMarkIn(function(agent){

				agent.post('/api/websites/edit/hmmm.com')
	                .send({
	                	name: 'Things',
	                	domain: 'ggnggng.com'
	                })
	                .end((err, res) => {
	                    res.should.have.status(404);
	                    done();
	                }); 

			});

		});

		it('should return 200 as domain should have updated', (done) => {

			logMarkIn(function(agent){

				agent.post('/api/websites/edit/yeah.co.uk')
	                .send({
	                	name: 'Things and Stuff',
	                	domain: 'newsite.com'
	                })
	                .end((err, res) => {
	                	console.log(res.body);
	                    res.should.have.status(200);
	                    done();
	                }); 

			});

		});

		it('should have changed the website Things to Stuff', (done) => {

			logMarkIn(function(agent){

				agent.post('/api/websites/edit/yeah.co.uk')
	                .send({
	                	name: 'Things and Stuff',
	                	domain: 'newsite.com'
	                })
	                .end((err, res) => {
	                    User.findOne({email: 'mark@mark.com'}, function(err, user){
	                    	user.websites[0].name.should.equal('Things and Stuff');
	                    	done();
	                    });
	                }); 

			});

		});

	});

	describe('DELETE /:domain', () => {

		beforeEach(function(done){
			User.findOneAndUpdate({email: 'mark@mark.com'}, {new: true}, {
				$push: {
					websites: {
						name: 'yeah',
						domain: 'yeah.co.uk'
					}
				}
			}, function(err, user){
				if(!err){
					done();
				}
				else{
					console.log(err);
				}
			});
		});

		afterEach(function(done){
			User.update({'email': 'mark@mark.com'}, {
				$set: {
					websites: []
				}
			}, function(err, affectedObj){
				
				done();
				
			});
		});

		it('should return 401 as no one is logged in', (done) => {

			chai.request(server)
                .delete('/api/websites/yeah.co.uk')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should return 404 as domain doesnt exist', (done) => {

			logMarkIn(function(agent){

				agent.delete('/api/websites/hmmmm.com')
	                .end((err, res) => {
	                    res.should.have.status(404);
	                    done();
	                }); 

			});

		});

		it('should remove domain things.com', (done) => { 

			logMarkIn(function(agent){

				agent.delete('/api/websites/yeah.co.uk')
	                .end((err, res) => {
	                    res.should.have.status(404);
	                    User.findOne({email: 'mark@mark.com'}, function(err, user){
	                    	user.websites.length.should.equal(0);
	                    	done();
	                    });
	                });

			});

		});

	});

	describe('GET /:domain/stats', () => {

		beforeEach(function(done){
			User.findOneAndUpdate({email: 'mark@mark.com'}, {
				$push: {
					websites: {
						name: 'yeah',
						domain: 'yeah.co.uk'
					}
				}
			}, function(err, user){
				if(!err){
					done();
				}
				else{
					console.log(err);
				}
			});
		});

		afterEach(function(done){
			User.update({'email': 'mark@mark.com'}, {
				$set: {
					websites: []
				}
			}, function(err, affectedObj){
				
				done();
				
			});
		});

		it('should return 401 as no one is logged in', (done) => {

			chai.request(server)
                .get('/api/websites/yeah.co.uk/stats')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should return 404 as domain doesnt exist for user', (done) => {

			logMarkIn(function(agent){

				agent.get('/api/websites/yeah.org/stats')
	                .end((err, res) => {
	                    res.should.have.status(404);
                    	done();
	                });

			});

		});

		it('should return property page_views', (done) => {

			logMarkIn(function(agent){

				User.findOne({email: 'mark@mark.com'}, function(err, user){

					agent.get('/api/websites/yeah.co.uk/stats')
	                .end((err, res) => {
	                    res.body.should.have.property('page_views');
	                    done();
	                });

				});

			});

		});

		it('should return property unique_devices', (done) => {

			logMarkIn(function(agent){

				agent.get('/api/websites/yeah.co.uk/stats')
	                .end((err, res) => {
	                    res.body.should.have.property('unique_devices');
	                    done();
	                });

			});

		});

	});

});