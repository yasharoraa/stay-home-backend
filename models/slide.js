var mongoose = require('mongoose');

var slideSchema = new mongoose.Schema({
    text : String,
    small_text : String,
    icon : String,
    uri : String,
    background : String
});

mongoose.model('Slide',slideSchema);