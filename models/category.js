var mongoose = require('mongoose');

var CategorySchama = new mongoose.Schema({
    cat_id : {
        type : String,
        unique : true,
        required :  true
    },
    image : {
        type : String,
        required : true
    },
    image_small : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required :  true
    },
    name_hi : {
        type : String,
        required : true
    }
});

mongoose.model('Category',CategorySchama);