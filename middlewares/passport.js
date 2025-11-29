// passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('../config/index');
const User = require('../models/User');

// ... (Giữ nguyên phần JWT Strategy ở trên) ...

// ========== LOCAL STRATEGY (LOGIN + LỖ HỔNG NoSQL INJECTION) ==========
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        console.log('⚠️ Dữ liệu nhận được:', { email, password });

        // 1. Kiểm tra email (để tránh crash nếu email là object)
        const normalizedEmail = (typeof email === 'string') 
                                ? email.toLowerCase().trim() 
                                : email;

        // 2. VULNERABLE CODE (CODE LỖ HỔNG Ở ĐÂY)
        // Lỗi: Chúng ta ném thẳng biến 'password' vào query của Mongoose
        // mà không kiểm tra nó là String hay là Object.
        // Nếu Hacker gửi password là { "$ne": "..." } thì Mongoose vẫn chạy!
        
        const user = await User.findOne({
          email: normalizedEmail,
          password: password  // <--- Lỗ hổng nằm ngay dòng này
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        console.error('[LOGIN ERROR]', error);
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
