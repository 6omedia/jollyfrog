process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Entry = require('../../../models/entry');
let Device = require('../../../models/device');
let ExcludedDevice = require('../../../models/excluded_device');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;
let fpsJson = require('../../json/excluded_devices.json');
var async = require('async');
// let insertDocs = require('../../helpers');

chai.use(chaiHttp);

var agent = chai.request.agent(server);

function logBillyIn(callback){

    agent
        .post('/')
        .send({ email: 'admin@hmm.com', password: '123', test: true})
        .end(function (err, res) {

            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

describe('blocked fingerprints routes', () => {

	before(function(done){
		User.remove({}, function(){
			User.create({
	            name: 'Billy',
	            email: 'admin@hmm.com',
	            password: '123',
	            apikey: 'fuckyeahapi',
	            meta: {
	                domain: 'website.com'
	            }
	        }, function(err, user){
	        	if(err){
	        		console.log(err);
	        	}
	        	done();
	        });
		});
	});

	describe('GET /api/blocked-devices', () => {

		before(function(done){

			User.findOne({email: 'admin@hmm.com'}, function(err, user){

				async.each(fpsJson, function(doc, callback){

					if(!doc.userId){
						doc.userId = user._id;
					}

					ExcludedDevice.create(doc, function(err, doc){
						callback();
					});

				});

				done();

			});

		});

		after(function(done){
			ExcludedDevice.remove({}, function(){
				done();
			});
		});

		it('should return 401 as no one is logged in', (done) => {

			chai.request(server)
                .get('/api/blocked-devices')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should return 3 docs as only 3 devices are blocked for this user', (done) => {

			logBillyIn(function(agent){
				 agent.get('/api/blocked-devices')
                    .end(function (err, res) {
                        res.body.devices.length.should.equal(3);
                        done();
                    });
			});

		});		

	});

	describe('POST /api/blocked-devices/add', () => {

		before(function(done){
			User.findOne({email: 'admin@hmm.com'}, function(err, user){

				async.each(fpsJson, function(doc, callback){

					if(!doc.userId){
						doc.userId = user._id;
					}

					ExcludedDevice.create(doc, function(err, doc){
						callback();
					});

				});

				done();

			});
		});

		after(function(done){
			ExcludedDevice.remove({}, function(){
				done();
			});
		});

		it('should return 401 as no one is logged in', (done) => {

			chai.request(server)
                .post('/api/blocked-devices/add')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should return 400 as device name is missing', (done) => {

			logBillyIn(function(agent){
				 agent.post('/api/blocked-devices/add')
				 	.send({
				 		device_name: '',
				 		fingerprint: 456544
				 	})
                    .end(function (err, res) {
                        
                    	res.should.have.status(400);
                    	done();

                    });
			});

		});

		it('should return 409 as fingerprint allready exists', (done) => {

			logBillyIn(function(agent){
				 agent.post('/api/blocked-devices/add')
				 	.send({
				 		device_name: 'Franks Mob',
				 		fingerprint: 34342
				 	})
                    .end(function (err, res) {
                        
                    	res.should.have.status(409);
                    	done();

                    });
			});

		});	

		it('should add a blocked device', (done) => {

			logBillyIn(function(agent){
				 agent.post('/api/blocked-devices/add')
				 	.send({
				 		device_name: 'Mathas Desktop',
				 		fingerprint: 456544
				 	})
                    .end(function (err, res) {
                        
                    	ExcludedDevice.findOne({device_name: 'Mathas Desktop'}, function(err, device){
                    		expect(device).to.exist;
                    		done();
                    	});

                    });
			});

		});		

	});

	describe('DELETE /api/blocked-devices/:fingerprint', (done) => {

		before(function(done){

			User.findOne({email: 'admin@hmm.com'}, function(err, user){

				async.each(fpsJson, function(doc, callback){

					if(!doc.userId){
						doc.userId = user._id;
					}

					ExcludedDevice.create(doc, function(err, doc){
						callback();
					});

				});

				done();

			});

		});

		after(function(done){
			ExcludedDevice.remove({}, function(){
				done();
			});
		});

		it('should return 401 as no one is logged in', (done) => {

			chai.request(server)
                .delete('/api/blocked-devices/898989')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                }); 

		});

		it('should remove blocked device', (done) => {

			logBillyIn(function(agent){
				agent.delete('/api/blocked-devices/898989')
				 	.send({
				 		device_name: 'Mathas Desktop',
				 		fingerprint: 456544
				 	})
                    .end(function (err, res) {
                        
                    	ExcludedDevice.findOne({fingerprint: 898989}, function(err, device){
                    		expect(device).to.not.exist;
                    		done();
                    	});

                    });
			});

		});	

	});

});