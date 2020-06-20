var mongoose = require('mongoose');

var tempSchema = new mongoose.Schema({
    phone: {
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
        index: { expires: '10m' },
    }
});

mongoose.model('ResetUser', tempSchema);
mongoose.model('ResetStore', tempSchema);