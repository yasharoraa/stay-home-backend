var router = require('express').Router();
var mongoose = require('mongoose');
var Order = mongoose.model('Order');
var User = mongoose.model('User');
var Store = mongoose.model('Store');
var auth = require('../auth');
var ObjectId = require('mongoose').Types.ObjectId;
const distance = require('../helpers/distance').haversineFormula;
const sendNotification = require('../helpers/fcm');

router.get('/user', auth.required, function (req, res, next) {

    var limit = 10;
    var offset = 0;

    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    }

    if (typeof req.query.offset !== 'undefined') {
        console.log(req.query.offset);
        offset = req.query.offset;
    }

    Promise.all([
        Order.find({ buyer: new ObjectId(req.payload.id) })
            .sort('-createdAt')
            .skip(Number(offset))
            .limit(Number(limit))
            .populate('seller', 'name')
            .exec(),
        Order.count({ buyer: new ObjectId(req.payload.id) })
    ]).then(function (results) {
        var orders = results[0];
        var orderCount = results[1];

        // setTimeout(()=>{res.json({
        //        orders : orders.map(function(order){
        //           return order.toListJsonFor();
        //        }),
        //        order_count : orderCount 
        //     })},2000 );
        return res.json({
            orders: orders.map(function (order) {
                return order.toListJsonFor();
            }),
            order_count: orderCount
        });
    }).catch(next);
});

router.get('/store', auth.required, function (req, res, next) {

    var limit = 10;
    var offset = 0;

    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    }

    if (typeof req.query.offset !== 'undefined') {
        offset = req.query.offset;
    }

    Order.find({ seller: new ObjectId(req.payload.id) })
        .sort('-createdAt')
        .skip(Number(offset))
        .limit(Number(limit))
        .then(function (orders) {
            if (typeof req.query.lat !== 'undefined' && typeof req.query.lon !== 'undefined') {
                return res.json(
                    orders.map(function (order) {
                        return order.toListJsonForStore(distance(req.query.lat, req.query.lon,
                            order.address.location[0], order.address.location[1]).toFixed(2));
                    })
                );
            } else {
                return res.json(
                    orders.map(function (order) {
                        return order.toListJsonForStore();
                    })
                );
            }

        }).catch(next);
});

router.get('/user/:orderId', auth.optional, function (req, res, next) {
    Order.findById(req.params.orderId)
        .populate('seller', 'name')
        .then(function (order) {
            if (!order) { return res.sendStatus(404); }
            return res.json(order.singleOrderForUser());
            //  setTimeout(()=>{res.json(order.singleOrderForUser())},2000 );
        }).catch(next);
});

router.get('/store/:orderId', auth.optional, function (req, res, next) {
    Order.findById(req.params.orderId)
        .then(function (order) {
            if (!order) { return res.sendStatus(404); }
            // setTimeout(() => {
            //     return res.json(order);
            // }, 2000);
            return res.json(order);
        }).catch(next);
});

router.put('/update/:orderId', auth.required, function (req, res, next) {
    Order.findById(req.params.orderId)
        .then(function (order) {
            if (!order.seller.equals(new ObjectId(req.payload.id))) {
                return res.sendStatus(401);
            }
            if (typeof req.query.code === 'undefined') {
                return res.sendStatus(501);
            }
            User.findById(order.buyer.toString()).then(function (user) {
                if (!user) { return res.sendStatus(500); }

                if (req.query.code == 201 || req.query.code == 301) {
                    if (order.status === 101) {
                        order.status = Number(req.query.code);
                        order.save().then(function (order) {
                            sendNotification(user.firebase, order.status, order._id, null, order.slug);
                            return res.json(order);
                        }).catch(next);
                    } else {
                        return res.sendStatus(500);
                    }

                } else if (req.query.code == 202) {
                    if (order.status === 201) {
                        order.status = Number(req.query.code);
                        order.save().then(function (order) {
                            sendNotification(user.firebase, order.status, order._id, null, order.slug);
                            return res.json(order);
                        }).catch(next);
                    } else {
                        return res.sendStatus(500);
                    }

                } else if (req.query.code == 204) {
                    if (order.status === 201 || order.status === 202) {
                        order.status = Number(req.query.code);
                        order.save().then(function (order) {
                            sendNotification(user.firebase, order.status, order._id, null, order.slug);
                            return res.json(order);
                        }).catch(next);
                    } else {
                        return res.sendStatus(500);
                    }

                } else {
                    return res.sendStatus(500);
                }
            }).catch(next);

        }).catch(next);
});

router.put('/cancel/:orderId', auth.required, function (req, res, next) {
    Order.findById(req.params.orderId)
        .then(function (order) {
            if (!order) { return res.sendStatus(404); }
            if (order.status < 200 && order.buyer.equals(new ObjectId(req.payload.id))) {
                order.status = 300;
                order.save().then(function (order) {
                    Store.findById(order.seller.toString()).then(function (store) {
                        if (!store) { return res.sendStatus(500); }
                        sendNotification(store.firebase, order.status, order._id, order.slip, order.slug);
                        return res.json(order.singleOrderForUser());
                    }).catch(next);
                }).catch(next);
            } else {
                return res.sendStatus(500);
            }

        }).catch(next);
});

router.post('/', auth.required, function (req, res, next) {
    User.findById(req.payload.id)
        .then(function (user) {
            if (!user || req.payload.salt !== user.salt) { return res.sendStatus(401); }

            if (typeof req.body.items === 'undefined' && typeof req.body.slip === 'undefined') {
                return res.sendStatus(500);
            }

            var order = new Order();

            order.buyer = req.payload.id;

            if (typeof req.body.items !== 'undefined') {
                order.items = req.body.items;
            }

            if (typeof req.body.seller !== 'undefined') {
                order.seller = req.body.seller;
            }

            if (typeof req.body.status !== 'undefined') {
                order.status = req.body.status;
            }

            if (typeof req.body.slip !== 'undefined') {
                order.slip = req.body.slip;
            }

            if (typeof req.body.address !== 'undefined') {
                order.address = req.body.address;
            }

            order.status = 101;

            order.save().then(function (order) {
                // setTimeout(()=>res.json(order),2000 );
                Store.findById(req.body.seller).then(function (store) {
                    if (!store) { return res.sendStatus(500); }
                    sendNotification(store.firebase, order.status, order._id, order.slip, order.slug);
                    return res.json(order);
                    
                }).catch(next);

            }).catch(next);

        }).catch(next);
})

module.exports = router;