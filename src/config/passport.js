const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const { clearNonPrintableCharacter } = require('xss');
const User = mongoose.model('User');

const options = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        let user = await User.findById(jwt_payload.id);

        if (user) {
          return done(null, user.id);
        }
        return done(null, false);
      } catch (error) {
        console.log(error);
      }
    })
  );
};
