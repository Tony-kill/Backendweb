const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('../config/index'); // Đảm bảo đường dẫn này đúng với project của bạn
const User = require('../models/User');

// ============================================================
// 1. JWT STRATEGY (Dùng để xác thực Token khi vào trang Secret)
// ============================================================
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // Tìm user dựa trên ID trong token
        const user = await User.findById(payload.sub);
        
        if (!user) {
          return done(null, false);
        }
        
        // Trả về user để các controller (như hàm secret) sử dụng
        return done(null, user);
      } catch (error) {
        console.error('[JWT ERROR]', error);
        return done(error, false);
      }
    }
  )
);

// ============================================================
// 2. LOCAL STRATEGY (CHỨA LỖ HỔNG ĐỂ DEMO)
// ============================================================
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        console.log('⚠️ Đang xử lý đăng nhập:', { email, password });

        // 1. Chuẩn hóa email (nếu là chuỗi)
        const normalizedEmail = (typeof email === 'string') 
                                ? email.toLowerCase().trim() 
                                : email;

        // 2. VULNERABLE CODE (LỖ HỔNG Ở ĐÂY)
        // Lỗi: Truyền thẳng password (có thể là object tấn công) vào query
        const user = await User.findOne({
          email: normalizedEmail,
          password: password 
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
