import User from '../models/user.model.js';
import { signAccess, signRefresh, verifyRefresh, setRefreshCookie } from '../utils/jwt.utils.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim())     return res.status(400).json({ message: 'Name is required' });
    if (!email?.trim())    return res.status(400).json({ message: 'Email is required' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Invalid email address' });
    if (!password)         return res.status(400).json({ message: 'Password is required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (name.trim().length > 50)  return res.status(400).json({ message: 'Name too long' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });
    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user: user.toSafeObject(), accessToken });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    setRefreshCookie(res, refreshToken);
    res.json({ user: user.toSafeObject(), accessToken });
  } catch (err) { next(err); }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
  res.json({ message: 'Logged out' });
}

export async function getMe(req, res) {
  res.json({ user: req.user.toSafeObject() });
}
