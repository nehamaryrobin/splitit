// server/src/config/passport.js
// Run: npm install passport passport-google-oauth20
//
// Add to server .env:
//   GOOGLE_CLIENT_ID=your_google_client_id
//   GOOGLE_CLIENT_SECRET=your_google_client_secret
//   GOOGLE_CALLBACK_URL=https://your-api.railway.app/api/v1/auth/google/callback

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // find by googleId first, then by email (link accounts)
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value;
          user = await User.findOne({ email });

          if (user) {
            // link existing email account to Google
            user.googleId = profile.id;
            user.avatar   = user.avatar || profile.photos?.[0]?.value;
            await user.save();
          } else {
            // brand new user
            user = await User.create({
              name:     profile.displayName,
              email:    profile.emails?.[0]?.value,
              googleId: profile.id,
              avatar:   profile.photos?.[0]?.value,
              password: Math.random().toString(36), // placeholder, never used
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
