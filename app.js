require('dotenv').config();
var cors = require('cors');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var commentsRouter = require('./routes/comments');
var cartsRouter = require('./routes/carts');
var ordersRouter = require('./routes/orders');
var wishlistRouter = require('./routes/wishlist');
var statisticalRouter = require('./routes/statistical');
var contactRouter = require('./routes/contacts');

var mongoose = require('./config/index');
mongoose.connect();

var app = express();

/* ================== CORS ================== */
// CORS cho tất cả origin + method, để frontend gọi thoải mái
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Nếu thích giữ luôn cors package thì thêm cũng được (không bắt buộc)
app.use(cors());
/* ========================================== */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/comments', commentsRouter);
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);
app.use('/wishlist', wishlistRouter);
app.use('/statistical', statisticalRouter);
app.use('/contacts', contactRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
