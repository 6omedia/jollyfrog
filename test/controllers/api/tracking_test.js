process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Entry = require('../../../models/entry');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

describe('tracking routes', () => {

	before(function(done){
		User.remove({}, function(){
			User.create({
	            name: 'Admin User',
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

	after(function(done){
        Entry.remove({}, function(err){
            done();
        });
    });

	describe('/POST log_page_view', () => {

		it('should return 400 as no api key has been set', (done) => {
			chai.request(server)
                .post('/api/log_page_view')
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });  
        });

        it('should return 403 as no api key is not found', (done) => {
        	chai.request(server)
                .post('/api/log_page_view')
                .send({
                	apikey: 'notanaipkey',
                	domain: 'website.com',
                	datapoint: {
                		name: 'page view',
                		value: 'www.website.com/stuff?hmm=yeah'
                	}
                })
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                }); 
        });

        it('should create a new entry', (done) => {
        	chai.request(server)
                .post('/api/log_page_view')
                .send({
                	apikey: 'fuckyeahapi',
                	domain: 'website.com',
                	url: 'www.website.com/stuff?hmm=yeah'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    Entry.findOne({domain: 'website.com'}, function(err, entry){
                    	should.exist(entry);
                    	done();
                    });
                });
        });

        it('new entry should have an ip', (done) => {
        	chai.request(server)
                .post('/api/log_page_view')
                .send({
                	apikey: 'fuckyeahapi',
                	domain: 'website.com',
                	url: 'www.website.com/stuff?hmm=yeah'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    Entry.findOne({domain: 'website.com'}, function(err, entry){
                    	entry.ip.should.equal('::ffff:127.0.0.1');
                    	done();
                    });
                }); 
        });

        it('new entry should have a date', (done) => {
        	chai.request(server)
                .post('/api/log_page_view')
                .send({
                	apikey: 'fuckyeahapi',
                	domain: 'website.com',
                	url: 'www.website.com/stuff?hmm=yeah'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    Entry.findOne({domain: 'website.com'}, function(err, entry){
                    	expect(entry.date).to.be.a('date')
                    	done();
                    });
                }); 
        });

        it('new entry should have a domain', (done) => {
        	chai.request(server)
                .post('/api/log_page_view')
                .send({
                	apikey: 'fuckyeahapi',
                	domain: 'website.com',
                	url: 'www.website.com/stuff?hmm=yeah'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    Entry.findOne({domain: 'website.com'}, function(err, entry){
                    	entry.domain.should.equal('website.com');
                    	done();
                    });
                }); 
        });

        it('new entry should have a device object', (done) => {
        	chai.request(server)
                .post('/api/log_page_view')
                .send({
                	apikey: 'fuckyeahapi',
                	domain: 'website.com',
                	url: 'www.website.com/stuff?hmm=yeah'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    Entry.findOne({domain: 'website.com'}, function(err, entry){
                    	entry.should.have.property('device');
                    	// console.log(entry.device);
                    	done();
                    });
                }); 
        });

        it('new entry should have a datapoint with property name that equals page view', (done) => {
        	chai.request(server)
                .post('/api/log_page_view')
                .send({
                	apikey: 'fuckyeahapi',
                	domain: 'website.com',
                	url: 'www.website.com/stuff?hmm=yeah'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    Entry.findOne({domain: 'website.com'}, function(err, entry){
                    	entry.data_point.name.should.equal('page view');
                    	done();
                    });
                }); 
        });

    });

	describe('/POST log_formsubmission', () => {

        var dataPoints = [
            {
                name: 'name',
                value: 'bob'
            },
            {
                name: 'email',
                value: 'bob@bob.com'
            },
            {
                name: 'consent',
                value: 'everything'
            }
        ];

		it('should return 400 as no api key has been set', (done) => {
        	chai.request(server)
                .post('/api/log_formsubmission')
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });  
        });

        it('should return 403 as no api key is not found', (done) => {

        	chai.request(server)
                .post('/api/log_formsubmission')
                .send({
                    apikey: 'notanaipkey',
                    domain: 'website.com',
                    datapoints: JSON.stringify(dataPoints),
                    form_name: 'test form'
                })
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                }); 

        });

        it('should create 3 new entries, name, email and consent', (done) => {

        	chai.request(server)
                .post('/api/log_formsubmission')
                .send({
                    apikey: 'fuckyeahapi',
                    domain: 'website.com',
                    datapoints: JSON.stringify(dataPoints),
                    form_name: 'test form'
                })
                .end((err, res) => {
                    Entry.find({form_name: 'test form'}, function(err, entries){
                        entries.length.should.equal(3);
                        done();
                    });
                });  

        });

        it('should return status 200', (done) => {

        	chai.request(server)
                .post('/api/log_formsubmission')
                .send({
                    apikey: 'fuckyeahapi',
                    domain: 'website.com',
                    datapoints: JSON.stringify(dataPoints),
                    form_name: 'test form'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });  

        });

	});

	// describe('/POST log_click', () => {

	// 	it('should return 400 as no api key has been set', (done) => {
 //        	done();
 //        });

 //        it('should return 403 as no api key is not found', (done) => {
 //        	done();
 //        });

 //        it('should create new entry with name that equals conversion_click', (done) => {
 //        	done();
 //        });

 //        it('should create new entry with value that equals Amazon Link Clicked', (done) => {
 //        	done();
 //        });

 //        it('should return status 200', (done) => {
 //        	done();
 //        });

	// });

});

///// in another file //////

// describe('segment routes', () => {

// });










 // form sub

// it('should create entry with data point name email', (done) => {
// 	chai.request(server)
//         .post('/api/log_page_view')
//         .send({
//         	apikey: 'fuckyeahapi',
//         	domain: 'website.com',
//         	datapoint: {
//         		name: 'email',
//         		value: 'yeah@hmmm.com'
//         	}
//         })
//         .end((err, res) => {
//             res.should.have.status(200);
//             Entry.findOne({domain: 'website.com'}, function(err, entry){
//             	entry.datapoint.name.should.equal('email');
//             	done();
//             });
//         }); 
// });

// it('should create entry with data point value yeah@hmmm.com', (done) => {
// 	chai.request(server)
//         .post('/api/log_page_view')
//         .send({
//         	apikey: 'fuckyeahapi',
//         	domain: 'website.com',
//         	datapoint: {
//         		name: 'email',
//         		value: 'yeah@hmmm.com'
//         	}
//         })
//         .end((err, res) => {
//             res.should.have.status(200);
//             Entry.findOne({domain: 'website.com'}, function(err, entry){
//             	entry.datapoint.name.should.equal('email');
//             	done();
//             });
//         }); 
// });

// // click

// it('should create entry with data point name click', (done) => {
// 	chai.request(server)
//         .post('/api/log_page_view')
//         .send({
//         	apikey: 'fuckyeahapi',
//         	datapoint: {
//         		name: 'click',
//         		value: 'Amazon Affiliate Link'
//         	}
//         })
//         .end((err, res) => {
//             res.should.have.status(200);
//             Entry.findOne({domain: 'website.com'}, function(err, entry){
//             	entry.datapoint.name.should.equal('click');
//             	done();
//             });
//         }); 
// });