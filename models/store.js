var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var StoreSchema = new mongoose.Schema({
    phone: { type: String, unique: true, required: [true, "can't be blank"], match: [/^\d+$/, 'is invalid'], index: true },
    name : {type: String, text : true },
    oname: String,
    gstin: String,
    address: String,
    pincode: Number,
    verified: {
        type: Boolean,
        default: false
    },
    accepted: {
        type: Boolean,
        default: false
    },
    online: Boolean,
    orders: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
        default: []
    },
    cat: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      default: undefined
    },
    city: String,
    coordinates: {
       type: [Number],
       default: undefined
    },
    firebase : String,
    place_id : String,
    profile_image : String,
    hash: String,
    salt: String,
    
}, { timestamps: true });

StoreSchema.index({name : 'text'});

StoreSchema.path('name').index({text : true});

StoreSchema.plugin(uniqueValidator, { message: 'Phone number already exists. Please login to continue.' });

StoreSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

StoreSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};
// StoreSchema.methods.changePassword = function (password) {
//     this.salt = crypto.randomBytes(16).toString('hex');
//     this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
//     return this.save();
// };

StoreSchema.methods.generateJWT = function () {
    // var today = new Date();
    // var exp = new Date(today);
    // exp.setDate(today.getDate() + 60);

    // return jwt.sign({
    //     id: this._id,
    //     username: this.username,
    //     exp: parseInt(exp.getTime() / 1000),
    // }, secret);

    return jwt.sign({
        id: this._id,
        phone: this.phone
    }, secret);
};

StoreSchema.methods.toAuthJSON = function () {
    return {
        phone: this.phone,
        token: this.generateJWT(),
    };
};

StoreSchema.methods.toLoginJSON = function() {
    return {
        token: this.generateJWT(),
        phone: this.phone,
        name: this.name,
        oname: this.oname,
        gstin: this.gstin,
        address: this.address,
        pincode: this.pincode,
        accepted: this.accepted,
        cat: this.cat,
        city: this.city,
        coordinates: this.coordinates,
        place_id: this.place_id,
        accepted: this.accepted
    }
}

StoreSchema.methods.toFindJSON = function() {
    return {
        _id: this._id,
        phone: this.phone,
        name: this.name,
        oname: this.oname,
        gstin: this.gstin,
        address: this.address,
        pincode: this.pincode,
        accepted: this.accepted,
        cat: this.cat,
        city: this.city,
        coordinates: this.coordinates,
        place_id: this.place_id,
        accepted: this.accepted,
        firebase: this.firebase
    }
}

StoreSchema.methods.toProfileJSONFor = function () {
    return {
        _id: this.id,
        phone: this.phone,
        name: this.name,
        oname: this.oname,
        gstin: this.gstin,
        address: this.address,
        profile_image: this.profile_image,
        pincode: this.pincode,
        city: this.city
    };
};

StoreSchema.methods.toListJSONFor = function (dis) {
    return {
        _id : this._id,
        name : this.name,
        oname : this.oname,
        address : this.address,
        online : this.online,
        cat : this.cat,
        coordinates : this.coordinates,
        profile_image : this.profile_image,
        phone: this.phone,
        distance : dis.toFixed(2)
    };
}

StoreSchema.method.setOnline = function (isOnline) {
    this.online = isOnline;
    return this.save();
}

StoreSchema.method.myorders = function () {
    return this.orders;
};

StoreSchema.methods.order = function (id) {
    this.orders.push(id);
    return this.save();
};

mongoose.model('Store', StoreSchema);




