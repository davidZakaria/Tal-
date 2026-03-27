const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL || 'http://localhost:5000').replace(/\/$/, '');

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `${backendPublicUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            user.avatar = user.avatar || (profile.photos && profile.photos[0] ? profile.photos[0].value : "");
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
              googleId: profile.id,
              role: 'Guest'
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 'placeholder',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'placeholder',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || `${backendPublicUrl}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'emails']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
          const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.id}@facebook.com`;
          user = await User.findOne({ email });
          if (user) {
            user.facebookId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email: email,
              facebookId: profile.id,
              role: 'Guest'
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

module.exports = passport;
