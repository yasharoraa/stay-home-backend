var mongoose = require('mongoose');
var Message = mongoose.model('Message');

module.exports = function (id) {
    const objectId = mongoose.Types.ObjectId(id);
    console.log(objectId);
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
            "$project": {
                to: 1,
                from: 1,
                text: 1,
                createdAt: 1,
                fromto: [
                    "$from",
                    "$to"
                ],
                read: 1
            }
        },
        {
            $unwind: "$fromto"
        },
        {
            $sort: {
                "fromto": 1
            }
        },
        {
            $group: {
                _id: "$_id",
                "fromto": {
                    $push: "$fromto"
                },
                "from": {
                    "$first": "$from"
                },
                "to": {
                    "$first": "$to"
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
        }
        ,
        {
            "$sort": {
                "createdAt": -1
            }
        }
        ,
        {
            "$group": {
                "_id": "$fromto",
                "messageId" : {
                    "$first": "$_id"
                },
                "from": {
                    "$first": "$from"
                },
                "to": {
                    "$first": "$to"
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
            "$project": {
                _id : {
                    $cond : {if: {$eq : ["$to",objectId]}, then : "$from", else : "$to"}
                },
                sent : {
                    $cond : {if: {$eq : ["$to",objectId]}, then : false, else : true }
                },
                text : 1,
                createdAt : 1,
                read : 1
            }
        }
    ]);
    //   .exec(function (err,result){
    //     if(err){
    //       return res.sendStatus(500);
    //     }
    //     if(result) {
    //       return res.json(result);
    //     }

    //   });
}