var Device = require('./device.js');
var moment = require('moment');

var mongoose = require('mongoose');
var EntrySchema = new mongoose.Schema({
	userId: String,
	ip: String,
	device: Number,
	browser: String,
	timezone: String,
    language: String,
	date: {
		type: Date
	},
	domain: String,
	data_point: {
		name: String,
		value: String
	},
	meta: Object,
	referer: String
});

EntrySchema.statics.getPageViews = function(userId, domain, fromDate, toDate, callback){

	let query = {
		'userId': userId,
		'domain': domain,
		'data_point.name': 'page view'
	};

	let selected = {
		browser: true,
		ip: true,
		timezone: true,
		date: true,
		data_point: true
	};

	Entry.find(query).select(selected).sort({date: -1}).limit(30).exec(function(err, pageViews){

		if(err){
			return callback(err, null);
		}

		for(i=0; i<pageViews.length; i++){

			let urlParts = pageViews[i].data_point.value.split('/');
			let url = '';

			for(j=3; j<urlParts.length; j++){
				url += '/' + urlParts[j];
			}

			pageViews[i].data_point.value = url;
			pageViews[i].display_date = moment(pageViews.date).format("MMM Do YY");
		}

		return callback(null, pageViews);

	});

};

EntrySchema.statics.getDevices = function(userId, domain, fromDate, toDate, callback){

	let query = {
		'userId': userId,
		'domain': domain
	};

	let selected = {
		fingerprint: true
	};

	Entry.find(query).distinct('device').exec(function(err, fingerPrints){

		if(err){
			return callback(err, null);
		}

		Device.find({
			fingerprint: {
				$in: fingerPrints
			}
		}, function(err, devices){

			if(err){
				return callback(err, null);
			}

			return callback(null, devices);

		});

	});

};

var Entry = mongoose.model('Entry', EntrySchema);
module.exports = Entry;