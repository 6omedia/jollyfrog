var Device = require('./device.js');

var mongoose = require('mongoose');
var ExcludedFingerPrintSchema = new mongoose.Schema({
	fingerprint: String,
	device_name: String
});