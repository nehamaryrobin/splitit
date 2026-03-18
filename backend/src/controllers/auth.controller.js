import User from '../models/user.model.js';
import { signAccess, signRefresh, verifyRefresh, setRefreshCookie } from '../utils/jwt.utils.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user: user.toSafeObject(), accessToken });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
}

export async function getMe(req, res) {
  res.json({ user: req.user.toSafeObject() });
}
