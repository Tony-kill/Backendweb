require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const commentsRouter = require('./routes/comments');
const cartsRouter = require('./routes/carts');
const ordersRouter = require('./routes/orders');
const wishlistRouter = require('./routes/wishlist');
const statisticalRouter = require('./routes/statistical');
const contactRouter = require('./routes/contacts');

// Mongo
const mongoose = require('./config/index');
mongoose.connect();

const app = express();

/* ============ CORS MỌI NƠI ============ */
// Cho phép frontend Render + mọi origin khác luôn
app.use((req, res, next) => {
  // Cho phép tất cả origin. Nếu muốn chặt, đổi thành:
  // 'https://frontendweb-attt.onrender.com'
  res.header('Access-Control-Allow-Origin', '*');

  // Cho phép mọi loại header client gửi lên
  res.header('Access-Control-Allow-Headers', '*');

  // Cho phép các method này
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  // Nếu là preflight (OPTIONS) thì trả luôn 200
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
/* ====================================== */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
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
