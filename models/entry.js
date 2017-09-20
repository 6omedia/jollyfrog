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
	form_name: String
});

var Entry = mongoose.model('Entry', EntrySchema);
module.exports = Entry;