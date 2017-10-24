process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Entry = require('../../../models/entry');
let Device = require('../../../models/device');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);
var agent = chai.request.agent(server);

describe('form routes', () => {

	before(function(done){

		User.remove({}, function(err){

			User.create({
	            name: 'Admin User',
	            email: 'admin@hmm.com',
	            password: '123',
	            apikey: 'fuckyeahapi',
	            websites: [
	            	{
	            		name: 'Franks Website',
	            		domain: 'frankssite.com'
	            	},
	            	{
	            		name: 'Things And Stuff',
	            		domain: 'thingsandstuff.co.uk'
	            	}
	            ]
	        }, function(err, user){
	        	if(err){
	        		console.log(err);
	        	}
	        	done();
	        });
			
		});

	});

	after(function(done){
        User.remove({}, function(err){
            done();
        });
    });

    function logMarkIn(callback){

	    agent
	        .post('/')
	        .send({ email: 'admin@hmm.com', password: '123', test: true})
	        .end(function (err, res) {

	            var loggedInUser = res.loggedInUser;
	            res.should.have.a.cookie;
	            callback(agent, loggedInUser);

	        });

	}

	describe('GET /:domain', () => {

		before(function(done){

			User.update({email: 'admin@hmm.com'},
				{
					$push: {
						'websites.$.frankssite.com': {
	            			name: 'contact form',
	            			fields: [
	            				{
	            					data_point: 'name',
						            input_id: 'q_name'
	            				},
	            				{
	            					data_point: 'email',
						            input_id: 'q_email'
	            				}
	            			]
	            		}
					}
				}, function(err, user){

					done();

				});

		});

		it('should return 401 as no one is logged in', (done) => {
			
			chai.request(server)
                .get('/api/forms/frankssite.com')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should return 404 as website does not exist', (done) => {
			
			logMarkIn(function(agent){

				agent.get('/api/forms/gfhjukid')
	                .end((err, res) => {
	                    res.should.have.status(404);
	                    done();
	                });

			});

		});

		it('should return all forms associated with franks website', (done) => {
			
			logMarkIn(function(agent){

				agent.get('/api/forms/frankssite.com')
	                .end((err, res) => {
	                    res.body.forms.length.should.equal(1);
	                    done();
	                });

			});

		});

	});

	describe('POST /add', () => {

		it('should return 401 as no one is logged in', (done) => {
			
			chai.request(server)
                .post('/api/forms/frankssite.com/add')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should return 400 as no form name was submited', (done) => {

			logMarkIn(function(agent){

				agent.post('/api/forms/frankssite.com/add')
					.send({
				        fields: [
				        	{
				            	data_point: 'first name',
				            	input_id: 'q_first_name'
				        	},
				        	{
				            	data_point: 'last name',
				            	input_id: 'q_last_name'
				        	}
				        ]
					})
	                .end((err, res) => {
	                    	
	                    res.should.have.status(400);
	                	done();

	                });

			});

		});

		it('should add a form to frankssite', (done) => {

			logMarkIn(function(agent){

				agent.post('/api/forms/frankssite.com/add')
					.send({
						name: 'signup form',
				        fields: [
				        	{
				            	data_point: 'first name',
				            	input_id: 'q_first_name'
				        	},
				        	{
				            	data_point: 'last name',
				            	input_id: 'q_last_name'
				        	}
				        ]
					})
	                .end((err, res) => {
	                    
	                	User.findOne({
	                		email: 'admin@hmm.com', 
	                		'websites.domain': 'frankssite.com',
	                		'websites.forms.name': 'signup form'   
	                	}, {'websites.forms.$': 1}, function(err, user){

	                		user.websites[0].forms[0].fields[0].data_point.should.equal('first name');
	                		done();

	                	});

	                });

			});

		});

	});

	describe('POST /update', () => {

		it('should return 401 as no one is logged in', (done) => {
			
			chai.request(server)
                .post('/api/forms/update')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should update form', (done) => {

			logMarkIn(function(agent){

				User.findOne({email: 'admin@hmm.com'}, function(err, user){

					agent.post('/api/forms/update')
					.send({
						id: user.websites.forms,
						domain: 'frankssite.com',
						name: 'newsletter form',
				        fields: [
				        	{
				            	data_point: 'first name',
				            	input_id: 'q_first_name'
				        	},
				        	{
				            	data_point: 'email',
				            	input_id: 'q_email'
				        	}
				        ]
					})
	                .end((err, res) => {
	                    res.body.forms.length.should.equal(1);
	                    done();
	                });

				});

			});

		});

	});

	describe('DELETE /:domain/:formid', () => {

		var formId = '';

		beforeEach(function(done){

			User.findOneAndUpdate(
				{
					email: 'admin@hmm.com',
					'websites.domain': 'thingsandstuff.co.uk'
				}, 
				{
					$push: {
						'websites.$.forms': {
							name: 'Hmm Form',
							fields: [
								{
									name: 'Shoes or Sandles',
									field_id: 'shoes_or_sandles'
								},
								{
									name: 'Elephants',
									field_id: 'elephants'
								}
							]
						}
					}
				},
				{
					projection: 'websites.$.forms',
					returnNewDocument: true
				},
			function(err, user){

				User.findOne({
					email: 'admin@hmm.com', 
					'websites.domain': 'thingsandstuff.co.uk'
				}, function(err, user){

					var form = user.websites[1].forms[0];
					formId = form._id;
					done();

				});

			});

		});

		afterEach(function(done){

			User.update(
				{
					email: 'admin@hmm.com', 
					'websites.domain': 'thingsandstuff.co.uk'
				}, 
				{
					$pull: {
						'websites.$.forms': {
							name: 'Hmm Form'
						} 
					}
				},
			function(err, user){

				done();

			});

		});

		it('should return 401 as no one is logged in', (done) => {
			
			chai.request(server)
                .delete('/api/forms/thingsandstuff.co.uk/' + formId)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		// it('should return 404 as id doesnt exist', (done) => {

		// 	logMarkIn(function(agent){

		// 		agent.delete('/api/forms/fbdfbd/43543643634')
	 //                .end((err, res) => {
	 //                    res.should.have.status(404);
	 //                    done();
	 //                }); 

		// 	});

		// });

		it('should return status 200', (done) => {

			logMarkIn(function(agent){

				agent.delete('/api/forms/thingsandstuff.co.uk/' + formId)
	                .end((err, res) => {
	                    res.should.have.status(200);
	                    done();
	                });

			});

		});

		it('should have removed form', (done) => {

			logMarkIn(function(agent){

				agent.delete('/api/forms/thingsandstuff.co.uk/' + formId)
	                .end((err, res) => {

	                	User.findOne({
	                		email: 'admin@hmm.com',
							'websites.domain': 'thingsandstuff.co.uk'
	                	}, {
	                		'websites.$': 1
	                	}, function(err, user){

	                		user.websites[0].forms.length.should.equal(0);
	                    	done();

	                	});

	                }); 

			});

		});

	});

});