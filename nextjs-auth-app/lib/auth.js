import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export function verifyAuth(req) {
  const { token } = cookie.parse(req ? req.headers.cookie || '' : document.cookie);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}
