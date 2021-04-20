var mongoose = require('mongoose');
var Message = mongoose.model('Message');

module.exports = function (id,skip,limit,type) {

    const objectId = mongoose.Types.ObjectId(id);

    return new Promise((resolve, reject) => {
        
        return Message.aggregate([
            {
                $match: {
                    $or: [
                        {
                            "to": objectId
                        },
                        {
                            "from": objectId
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: {
                        $cond: { if: { $eq: ["$to", objectId] }, then: "$from".toString(), else: "$to".toString() }
                    },
                    sent: {
                        $cond: { if: { $eq: ["$to", objectId] }, then: false, else: true }
                    },
                    text: 1,
                    createdAt: 1,
                    read: 1
                }
            },
            {
                $sort: {
                    createdAt : -1
                }
            },
            {
                $group: {
                    "_id": "$_id",
                    "sent": {
                        "$first": "$sent"
                    },
                    "text": {
                        "$first": "$text"
                    },
                    "createdAt": {
                        "$first": "$createdAt"
                    },
                    "read": {
                        "$first": "$read"
                    }
                }
            },
            {
                $sort: {
                    createdAt : -1
                }
            },
            {
                $limit: skip + limit
            },
            {
                $skip: skip
            }

        ]).exec(function(err,result){
            if(err) {
              console.log(err);
              return reject(err);
            }
            if(result) {
              Message.populate(result,{path : '_id', model : type == 0 ? 'Store' : 'User', select : ['name','image'] }, function(err,chat) {
                if(chat) {
                  return resolve(chat);
                }
                if(err) {
                  console.log(err);
                  return reject(err); 
                }
              });
            }
          });
    });
}