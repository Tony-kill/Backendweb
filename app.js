require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const commentsRouter = require('./routes/comments');
const cartsRouter = require('./routes/carts');
const ordersRouter = require('./routes/orders');
const wishlistRouter = require('./routes/wishlist');
const statisticalRouter = require('./routes/statistical');
const contactRouter = require('./routes/contacts');

const mongoose = require('./config/index');
mongoose.connect();

const app = express();

/* ============ CORS ============ */
// Cho phép tất cả origin gọi API (cho demo đồ án)
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

// preflight cho mọi route
app.options('*', cors(corsOptions));
// áp dụng cors cho tất cả request
app.use(cors(corsOptions));
/* ============================== */

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
