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
    },
    email: String
});

DeviceSchema.statics.addDeviceIfNew = function(deviceObj, callback){

    Device.findOne({fingerprint: deviceObj.fingerprint}, function(err, device){

        if(err){
            callback(err, null);
        }

        if(!device){

            Device.create({
                fingerprint: deviceObj.fingerprint,
                type: deviceObj.type,
                vendor: deviceObj.vendor,
                os: deviceObj.os,
                screen: {
                    res: deviceObj.screen.res,
                    colorDepth: deviceObj.screen.colorDepth
                }
            }, function(err, device){

                if(err){
                    callback(err, null);
                }

                callback(null, device);

            });

        }

    });

};

var Device = mongoose.model('Device', DeviceSchema);
module.exports = Device;