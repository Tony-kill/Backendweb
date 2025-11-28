require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

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

/* ============ CORS CHO MỌI REQUEST ============ */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://frontendweb-attt.onrender.com' // domain frontend trên Render của bạn
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    // cho phép origin frontend
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    // cho phép tạm cho các origin khác (curl, direct link…)
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// dùng thêm cors() cho chắc
app.use(
  cors({
    origin: function (origin, callback) {
      // cho phép request không có origin (Postman, curl…)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // nếu muốn chặt hơn thì callback(new Error('Not allowed by CORS'));
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
/* =============================================== */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// MOUNT CÁC ROUTER
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
