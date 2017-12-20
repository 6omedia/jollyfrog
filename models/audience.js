var Device = require('./device.js');
var Entry = require('./entry.js');
var ExcludedDevice = require('./excluded_device.js');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AudienceSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
		},
		name: String,
        domains: Array,
        browser: Array,
        category: Array,
        funnel_position: String
	}
);

AudienceSchema.methods.generate = function(dateFrom, dateTo, userId, callback){

	/** JUST DOMAINS FOR NOW **/

	var domains = this.domains;
	var browsers = this.browser;
	var funnel_position = this.funnel_position;

	let query = {
		'domain': { $in: domains }
	};

	if(browsers.length > 0){
		query.browser = { $in: browsers };
	}

	if(funnel_position){
		query.meta = {};
		query.meta.funnel_position = funnel_position;
	}

	Entry.find(query).distinct('device').exec(function(err, entries){

		if(err){
			callback(err);
		}

		let devs = [];

		entries.forEach(function(ent){
			devs.push(ent);
		});

		ExcludedDevice.find({userId: userId}).select({fingerprint: true}).exec(function(err, exDevs){

			if(err){
				return callback(err, null);
			}

			let exDevsArr = [];

			for(i=0; i<exDevs.length; i++){
				exDevsArr.push(exDevs[i].fingerprint);
			}

			Device.find({
				fingerprint: {
					$in: devs,
					$nin: exDevsArr
				}, 
				email: {$exists: true}
			}, function(err, devices){

				if(err){
					callback(err);
				}

				callback(null, devices);

			});

		});

	});

};

var Audience = mongoose.model('Audience', AudienceSchema);
module.exports = Audience;