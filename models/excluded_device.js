var mongoose = require('mongoose');
var ExcludedDeviceSchema = new mongoose.Schema({
	userId: String,
	fingerprint: {
		unique: true,
		type: Number
	},
	device_name: String
});

var ExcludedDevice = mongoose.model('ExcludedDevice', ExcludedDeviceSchema);
module.exports = ExcludedDevice;