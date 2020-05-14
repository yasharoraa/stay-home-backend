var router = require('express').Router();

router.use('/orders',require('./orders'));
router.use('/stores',require('./stores'));
router.use('/users',require('./users'));
router.use('/test',require('./test'));
router.use('/categories',require('./categories'));
router.use('/slides',require('./slides'));
router.use('/upload',require('./upload'));
router.use('/address',require('./addresses'));


router.use(function(err, req, res, next){
    if(err.name === 'ValidationError'){
      return res.status(422).json({
        errors: Object.keys(err.errors).reduce(function(errors, key){
          errors[key] = err.errors[key].message;
  
          return errors;
        }, {})
      });
    }
  
    return next(err);
  });
  
  module.exports = router;