var mongoose = require('mongoose');

var tempSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    pass: {
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
        index: { expires: '1m' },
    },
});

mongoose.model('TempUser', tempSchema);
mongoose.model('TempStore', tempSchema);