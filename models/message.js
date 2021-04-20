var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true
    },
    from : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        refPath : 'fromModel'
    },
    to : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        refPath : 'toModel'
    },
    fromModel : {
        type : String,
        required : true,
        enum : ['User','Store']
    },
    toModel : {
        type : String,
        required : true,
        enum : ['User','Store']
    },
    read : {
        type : Boolean,
        default : false
    }

}, { timestamps: { createdAt: true, updatedAt: false } });

mongoose.model('Message', messageSchema);