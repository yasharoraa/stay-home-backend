var mongoose = require('mongoose');

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
    },

    user :{
        type : String,
        required : true
    } 
}, { timestamps: true });

mongoose.model('Address',AddressSchema);