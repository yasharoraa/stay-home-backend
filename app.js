require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var passport = require('passport');
var mongoose = require('mongoose');
var mongoUrl = require('./config').mongoUrl;
var admin = require('firebase-admin');
var serviceAccount = require('./config/service_account_file.json');
var check = require('./check');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const connect = mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

connect.then((db) => {
  console.log('Connected correctly to server');

}, (err) => {
  console.log(err);
});

// catch 404 and forward to error handler

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})



require('./models/user');
require('./models/store');
require('./models/category');
require('./models/address');
require('./models/order')
require('./models/slide');
require('./models/temp');
require('./models/reset');
require('./models/message');
require('./config/userpassport');
require('./routes/auto_cancel_order');


app.all('/api/*', check);

app.use(require('./routes'));

// error handler



app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === "production" ? {} : err;
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


