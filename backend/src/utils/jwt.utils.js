import jwt from 'jsonwebtoken';

export function signAccess(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES,
  });
}

export function signRefresh(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
}

export function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,                          // never readable by JS
    secure: isProd,                          // HTTPS only in production
    sameSite: isProd ? 'none' : 'strict',   // 'none' needed for cross-origin (Vercel → Railway)
    maxAge: 7 * 24 * 60 * 60 * 1000,       // 7 days
  });
}
