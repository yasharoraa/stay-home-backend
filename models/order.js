var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var User = mongoose.model('User');
var slug = require('slug');

var ItemSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true
    },
    quantity: {
        type : Number,
        required : true
    },
    unit: String
}, { _id: false });

var AddressSchema = new mongoose.Schema({
    flat_address: {
        type : String,
        required :  true
    },
    number : String,
    htr : String,
    location : {
       type : [Number],
       required : true,
       default: undefined
    },

    location_address :  {
        type : String,
        required : true
    }
}, { _id: false });

var OrderSchema = new mongoose.Schema({
    slug: { type: String, unique: true },
    items: [ItemSchema],
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required : true},
    time: Number,
    status: Number,
    slip: String,
    address : {
        type : AddressSchema,
        required : true
    }
}, { timestamps: true });

OrderSchema.plugin(uniqueValidator, { message: 'is already taken' });

OrderSchema.pre('validate', function (next) {
    if (!this.slug) {
        this.slugify();
    }

    next();
});

OrderSchema.methods.slugify = function() {
    this.slug = (Math.floor(Math.random() * 9000000000) + 1000000000).toString().trim();
};

OrderSchema.methods.updateStatus = function (status) {
    this.status = status;
    return this.save();
};

OrderSchema.methods.toListJsonFor = function() {
    return {
        _id : this._id,
        slug : this.slug,
        status : this.status,
        slip : this.slip,
        seller : this.seller,
        createdAt : this.createdAt

    };
};

OrderSchema.methods.toListJsonForStore = function(dist) {
    return {
        _id : this._id,
        slug : this.slug,
        status : this.status,
        slip :  this.slip,
        createdAt : this.createdAt,
        distance : dist
    };
};

OrderSchema.methods.singleOrderForUser = function() {
    return {
        _id : this._id,
        slug : this.slug,
        status : this.status,
        slip : this.slip,
        seller : this.seller,
        address : this.address,
        items : this.items
    };
};

mongoose.model('Order', OrderSchema);

