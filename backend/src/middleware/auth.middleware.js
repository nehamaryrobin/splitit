import { verifyAccess } from '../utils/jwt.utils.js';
import User from '../models/user.model.js';

export async function protect(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const payload = verifyAccess(auth.split(' ')[1]);
    req.user = await User.findById(payload.sub).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
}
