var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    }
}, { timestamps: true });

mongoose.model('Message', messageSchema);