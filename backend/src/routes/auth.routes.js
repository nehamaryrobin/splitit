import { Router } from 'express';
import passport from 'passport';
import '../config/passport.js'; // register Google strategy
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller.js';
import { signAccess, signRefresh, setRefreshCookie } from '../utils/jwt.utils.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// ── Email / password ──────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refresh);
router.post('/logout',   logout);
router.get('/me',        protect, getMe);

// ── Google OAuth ──────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_ORIGIN}/login?error=google`,
    session: false,
  }),
  (req, res) => {
    const accessToken  = signAccess(req.user._id);
    const refreshToken = signRefresh(req.user._id);
    setRefreshCookie(res, refreshToken);
    // Send token to frontend via redirect — OAuthCallback page reads + strips it
    res.redirect(`${process.env.CLIENT_ORIGIN}/auth/callback?token=${accessToken}`);
  }
);

export default router;
