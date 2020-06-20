var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema = new mongoose.Schema({
    phone: { type: String, unique: true, required: [true, "can't be blank"], match: [/^\d+$/, 'is invalid'], index: true },
    name: String,
    pincode : Number,
    firebase : String,
    hash : String,
    salt: String
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message:'Phone number already exists. Please login to continue.' });

UserSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// UserSchema.methods.generateJWT = function () {
//     var today = new Date();
//     var exp = new Date(today);
//     exp.setDate(today.getDate() + 60);

//     return jwt.sign({
//         id: this._id,
//         username: this.username,
//         exp: parseInt(exp.getTime() / 1000),
//     }, secret);
// };


UserSchema.methods.generateJWT = function () {
    return jwt.sign({
        id: this._id,
        salt: this.salt
    }, secret);
};

UserSchema.methods.toAuthJSON = function () {
    return {
        phone: this.phone,
        token: this.generateJWT(),
    };
};

UserSchema.methods.toProfileJSONFor = function (user) {
    return {
        _id : this._id,
        phone: this.phone,
    };
};



UserSchema.method.myorders = function(){
    return this.orders;
};

UserSchema.methods.order = function(id) {
    this.orders.push(id);
    return this.save();
};

mongoose.model('User', UserSchema);




