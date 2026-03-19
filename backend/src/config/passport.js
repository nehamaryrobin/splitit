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
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        // 1. Already has a Google-linked account
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2. Account exists with same email — link it
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = avatar;
          await user.save();
          return done(null, user);
        }

        // 3. Brand new user
        user = await User.create({
          name:     profile.displayName,
          email,
          googleId: profile.id,
          avatar,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
