// ── Add these to server/src/routes/auth.routes.js ─────────────────────────
//
// 1. npm install passport passport-google-oauth20
// 2. Add to User model:  googleId: String,  avatar: String
// 3. Import passport in src/index.js and call app.use(passport.initialize())
// 4. Import passport config in src/index.js: import './config/passport.js'

// Add these imports at the top of auth.routes.js:
//   import passport from 'passport';
//   import '../config/passport.js';

// Add these routes BEFORE export default router:

/*
// ── Google OAuth ─────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_ORIGIN}/login?error=google`, session: false }),
  (req, res) => {
    // Issue tokens and redirect to frontend with accessToken in URL
    // (frontend reads it from URL, stores in localStorage, then strips URL)
    const accessToken  = signAccess(req.user._id);
    const refreshToken = signRefresh(req.user._id);
    setRefreshCookie(res, refreshToken);
    res.redirect(`${process.env.CLIENT_ORIGIN}/auth/callback?token=${accessToken}`);
  }
);
*/

// ── Frontend: add this route to App.jsx ──────────────────────
// <Route path="/auth/callback" element={<OAuthCallback />} />

// ── Frontend: create src/pages/OAuthCallback.jsx ─────────────
/*
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { fetchMe } = useAuth(); // add fetchMe to AuthContext if needed

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      // Clean the token from the URL immediately
      window.history.replaceState({}, '', '/auth/callback');
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=oauth', { replace: true });
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
*/

export const GOOGLE_OAUTH_NOTES = `
Steps to enable Google OAuth:
1. Go to console.cloud.google.com → New Project → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorised redirect URIs: https://your-api.railway.app/api/v1/auth/google/callback
4. Copy Client ID and Secret into server .env
5. npm install passport passport-google-oauth20 in /server
6. Uncomment the routes above in auth.routes.js
7. Add googleId + avatar fields to User model
8. Add app.use(passport.initialize()) in src/index.js
9. Add OAuthCallback page + route in the frontend
`;
