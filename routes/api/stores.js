var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var Store = mongoose.model('Store');
var User = mongoose.model('User');
var StoreTemp = mongoose.model('TempStore');
var StoreReset = mongoose.model('ResetStore');
var Store = mongoose.model('Store');

var auth = require('../auth');
var admin = require('firebase-admin');
const distance = require('../helpers/distance').haversineFormula;
var ObjectId = require('mongoose').Types.ObjectId;

router.get('/', auth.required, function (req, res, next) {
  Store.findById(req.payload.id).then(function (store) {
    if (req.payload.salt !== store.salt) { return res.sendStatus(401); }

    return res.json(store.toFindJSON());
  }).catch(next);
});

router.get('/profile', auth.required, function (req, res, next) {
  Store.findById(req.payload.id).then(function (store) {
    if (req.payload.salt !== store.salt) { return res.sendStatus(401); }
    return res.json(store.toProfileJSONFor());
  }).catch(next);
})

router.get('/amionline', auth.required, function (req, res, next) {
  Store.findById(req.payload.id).then(function (store) {
    if (req.payload.salt !== store.salt) { return res.sendStatus(401); }
    return res.json({ 'online': store.online });
  }).catch(next);
});

router.put('/online', auth.required, function (req, res, next) {
  Store.findById(req.payload.id).then(function (store) {
    if (req.payload.salt !== store.salt) { return res.sendStatus(401); }
    if (typeof req.query.online === 'undefined') { return res.sendStatus(500); }
    store.online = Boolean(Number(req.query.online));
    return store.save().then(function () {
      return res.json({ 'online': store.online });
    }).catch(next);
  }).catch(next);
});


router.get('/nearby', auth.optional, function (req, res, next) {
  var limit = 10;
  var offset = 0;
  var param = {};

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  if (typeof req.query.city !== 'undefined') {
    param['city'] = req.query.city;
  }

  if (typeof req.query.cat !== 'undefined') {
    param['cat'] = new ObjectId(req.query.cat);
  }

  if (typeof req.query.search !== 'undefined') {
    param['$text'] = { $search: req.query.search };
  }

  param['accepted'] = true;

  Store.find(param)
    .then(function (stores) {
      if (typeof req.query.lat !== 'undefined' &&
        typeof req.query.lon !== 'undefined') {
        stores.map(function (store) {
          return store.distance = distance(req.query.lat, req.query.lon,
            store.coordinates[0], store.coordinates[1]);
        });

        stores.sort(function (x, y) {
          return (x.distance < y.distance) ? -1 : 1;
        });
      }

      if (stores.length > Number(offset)) {
        stores.splice(0, Number(offset));
        if (stores.length > limit) {
          stores.length = limit;
        }
      } else {
        stores = [];
      }

      Store.populate(stores, { path: 'cat', model: 'Category', select: ['image_small', 'name', 'name_hi'] },
        function (err, stores) {
          return res.json(stores.map(function (store) {
            return store.toListJSONFor(store.distance);
          }));
        });
    }).catch(next);
});

router.get('/bypincode', auth.optional, function (req, res, next) {
  var pincode;

  if (typeof req.query.pincode !== 'undefined') {
    pincode = req.query.pincode;
    findStores(res, pincode, req, next);
  } else {
    User.findById(req.payload.id).then(function (user) {
      console.log(user.pincode);
      if (user && user.pincode) {
        pincode = user.pincode;
        if (!pincode) { return res.sendStatus(405); }
        findStores(res, pincode, req, next);
      }
    }).catch(next);
  }
});

function findStores(res, pincode, req, next) {

  var limit = 10;
  var offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }
  Store.find({ pincode: Number(pincode) })
    .then(function (stores) {

      if (typeof req.query.lat !== 'undefined' &&
        typeof req.query.lon !== 'undefined') {
        stores.sort(function (x, y) {
          return (distance(req.query.lat, req.query.lon,
            x.latitude, x.longitude) <
            distance(req.query.lat, req.query.lon,
              y.latitude, y.longitude)) ? -1 : 1;
        })
      }

      if (stores.length > Number(offset)) {
        stores.splice(0, Number(offset));
        if (stores.length > limit) {
          stores.length = limit;
        }
      } else {
        stores = [];
      }

      return res.json(stores.map(function (store) {
        return store.toListJSONFor(store);
      }));
    }).catch(next);
}


router.put('/firebase', auth.required, function (req, res, next) {
  Store.findById(req.payload.id).then(function (store) {
    if (req.payload.salt !== store.salt) { return res.sendStatus(401); }
    if (typeof req.query.firebase !== 'undefined') {
      store.firebase = req.query.firebase;
      return store.save().then(function () {
        return res.sendStatus(200);
      }).catch(next);
    }
  }).catch(next);
});

router.put('/', auth.required, function (req, res, next) {
  Store.findById(req.payload.id).then(function (store) {
    if (req.payload.salt !== store.salt) { return res.sendStatus(401); }

    // only update fields that were actually passed...
    if (typeof req.body.name !== 'undefined') {
      store.name = req.body.name;
    }
    if (typeof req.body.oname !== 'undefined') {
      store.oname = req.body.oname;
    }
    if (typeof req.body.gstin !== 'undefined') {
      store.gstin = req.body.gstin;
    }
    if (typeof req.body.address !== 'undefined') {
      store.address = req.body.address;
    }
    if (typeof req.body.pincode !== 'undefined') {
      store.pincode = req.body.pincode;
    }
    if (typeof req.body.cat !== 'undefined') {
      store.cat = req.body.cat;
    }
    if (typeof req.body.city !== 'undefined') {
      store.city = req.body.city;
    }
    if (typeof req.body.coordinates !== 'undefined') {
      store.coordinates = req.body.coordinates;
    }
    if (typeof req.body.place_id !== 'undefined') {
      store.place_id = req.body.place_id;
    }

    return store.save().then(function () {
      return res.json(store.toProfileJSONFor());
    }).catch(next);

  }).catch(next);
});

router.post('/login', function (req, res, next) {
  if (!req.body.user.phone) {
    return res.status(422).json({ errors: { phone: "can't be blank" } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }
  req.isStore = true;

  passport.authenticate('local', { session: false }, function (err, store, info) {
    if (err) { return next(err); }

    if (store) {
      return res.json(store.toLoginJSON());
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/:temp', function (req, res, next) {
  StoreTemp.findById(req.params.temp).then(function (temp) {
    if (!temp) { return res.status(422).send({ errors: { 'User': 'OTP Expired' } }) };
    if (Number(req.query.otp) === temp.code) {
      var store = new Store();
      store.phone = temp.phone;
      store.setPassword(temp.password);
      store.save().then(function (store) {
        // setTimeout(()=>res.json(address),2000 );
        return res.json(store.toAuthJSON());
      }).catch(next);
    } else {
      return res.status(422).send({ errors: { 'User': 'OTP Incorrect' } })
    }
  }).catch(next);
});

router.put('/reset', function (req, res, next) {
  if (req.body.reset === 'undefined') { return res.status(500).send({ errors: { 'Id': 'Invalid Id, Please try again later.' } }); }
  StoreReset.findById(req.body.reset).then(function (reset) {
    if (!reset) { return res.status(422).send({ errors: { 'Store': 'OTP Expired' } }) };
    if (req.body.phone === reset.phone) {
      if (req.body.code === reset.code) {
        if (req.body.password !== 'undefined') {
          Store.findOne({ phone: reset.phone }).then(function (store) {
            if (!store) { return res.sendStatus(401); }
            store.setPassword(req.body.password);
            store.save().then(function () {
              return res.sendStatus(200);
            }).catch(next);
          }).catch(next);
        } else {
          return res.status(500).send({ errors: { 'User': 'Invalid Password, Please try again later.' } })
        }
      } else {
        return res.status(401).send({ errors: { 'OTP': 'Incorrect OTP' } });
      }
    } else {
      return res.status(500).send({ errors: { 'User': 'Invalid Phone Number, Please try again later.' } })
    }
  }).catch(next);
});



module.exports = router;