var mongoose = require('mongoose');

var tempSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    code: {
        type: Number,
        required: true,
        default: undefined
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' },
    },
});



mongoose.model('TempUser', tempSchema);
mongoose.model('TempStore', tempSchema);