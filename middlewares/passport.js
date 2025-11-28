const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('../config/index');
const User = require('../models/User');

// ========== JWT STRATEGY ==========
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // đúng chuẩn, không truyền tham số
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        console.error('[JWT STRATEGY ERROR]', error);
        return done(error, false);
      }
    }
  )
);

// ========== LOCAL STRATEGY (LOGIN + LỖ HỔNG DEMO) ==========
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        const normalizedEmail = email.toLowerCase().trim();
        let user = null;

        console.log('⚠️ ĐANG DÙNG TRUY VẤN CÓ LỖ HỔNG INJECTION (DEMO ONLY)');

        // ---- 1) THỬ DÙNG $where (lỗ hổng) ----
        try {
          user = await User.findOne({
            $where: `this.email == '${normalizedEmail}' && this.password == '${password}'`,
          });
        } catch (err) {
          // Atlas free tier chặn $where => lỗi 8000, rơi vào đây
          console.log('[Atlas chặn $where] code:', err.code, 'codeName:', err.codeName);
        }

        // ---- 2) Nếu Atlas chặn $where hoặc không tìm thấy user -> fallback an toàn ----
        if (!user) {
          user = await User.findOne({
            email: normalizedEmail,
            password: password,
          });
        }

        if (!user) {
          return done(null, false); // email/pass sai
        }

        return done(null, user);
      } catch (error) {
        console.error('[LOCAL STRATEGY ERROR]', error);
        return done(error, false);
      }
    }
  )
);

module.exports = passport;
