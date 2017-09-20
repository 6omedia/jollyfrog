var mongoose = require('mongoose');
var DeviceSchema = new mongoose.Schema({
    fingerprint: {
        type: Number,
        unique: true
    },
    type: String,
    vendor: String,
    os: String,
    screen: {
        res: String,
        colorDepth: String
    }
});

var Device = mongoose.model('Device', DeviceSchema);
module.exports = Device;