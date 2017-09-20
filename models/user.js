const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

//book schema definition
let UserSchema = new Schema(
    {
        name: {
          type: String,
          required: true
        },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        admin: {
          type: Boolean,
          default: false
        },
        apikey: {
            type: String,
            unique: true
        },
        created_at: Date,
        updated_at: Date  
    }
);

// Sets the createdAt parameter equal to the current time
UserSchema.pre('save', function(next){

    var now = new Date();
 
    if(this.isNew) {
        this.created_at = now;
    }

    var user = this;

    bcrypt.hash(user.password, 10, function(err, hash){
        if(err){
            return next(err);
        }
        user.password = hash;
        next();
    });

});

UserSchema.statics.registerUser = function(userObj, callback){

    if(userObj.name == '' || userObj.name == undefined){
        return callback('Name required');
    }

    if(userObj.email == '' || userObj.email == undefined){
        return callback('Email required');
    }

    if(userObj.password == '' || userObj.password == undefined){
        return callback('Password required');
    }

    if(userObj.password != userObj.confirm_password){
        return callback('Passwords do not match');
    }

    this.create(userObj, function(err, user){

        if(err){
            if (err.name === 'MongoError' && err.code === 11000) {
                return callback('That email address allready exists');
            }
            return callback(err.message, null);
        }

        callback(null, user);

    });

};

UserSchema.statics.authenticate = function(email, password, callback){

    this.findOne({'email': email}, function(err, user){

        if(err){
            err.status = 400;
            return callback(err, null);
        }else if(!user){
            var err = new Error('User not found');
            err.status = 401;
            return callback(err, null);
        }

        bcrypt.compare(password, user.password, function(err, result){

            if(result === true){
                return callback(null, user);
            }else{
                var error = {};
                var err = new Error('Incorrect Password');
                err.status = 401;
                return callback(err, null);
            }

        });

    });

};

UserSchema.statics.isAdmin = function(id, callback){
    this.findById(id, function(err, user){
        if(err){
            return callback(err, null);
        }
        return callback(null, user.admin);
    });
};

var User = mongoose.model("User", UserSchema);

User.find({}, function(err, users){

    if(!users || users == ''){

        User.create({
            name: 'Admin User',
            email: 'admin@user.com',
            password: '123',
            apikey: 'apimustchange',
            websites: [{
                domain: String,
                forms: Array
            }],
            admin: true
        }, function(err, user){

        });
        
    }

});

//Exports the BookSchema for use elsewhere.
module.exports = User;