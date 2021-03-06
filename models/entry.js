var Device = require('./device.js');
const ExcludedDevice = require('./excluded_device');
var moment = require('moment');

var mongoose = require('mongoose');
var EntrySchema = new mongoose.Schema({
	userId: String,
	ip: String,
	device: Number,
	browser: String,
	timezone: String,
	form_name: String,
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

EntrySchema.statics.getPageViews = function(userId, domain, fromDate, toDate, fp, callback){

	ExcludedDevice.find({userId: userId}).select({fingerprint: true}).exec(function(err, exDevs){

		if(err){
			return callback(err, null);
		}

		let exDevsArr = [];

		for(i=0; i<exDevs.length; i++){
			exDevsArr.push(exDevs[i].fingerprint);
		}

		let query = {
			// 'userId': userId,
			'domain': domain,
			'data_point.name': 'page view',
			'device': {
				"$nin": exDevsArr
			}
		};

		if(fp != '' && fp != 'All'){
			query['meta.funnel_position'] = fp.toLowerCase();
		}

		let selected = {
			browser: true,
			ip: true,
			timezone: true,
			date: true,
			data_point: true
		};

		Entry.find(query).select(selected).sort({date: -1}).lean().limit(30).exec(function(err, pageViews){

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
				pageViews[i].display_date = moment(pageViews[i].date).format("MMM Do YY");

			}

			return callback(null, pageViews);

		});

	});

};

EntrySchema.statics.getDevices = function(userId, domain, fromDate, toDate, fp, callback){

	let query = {
		// 'userId': userId,
		'domain': domain
	};

	if(fp != '' && fp != 'All'){
		query['meta.funnel_position'] = fp.toLowerCase();
	}

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