import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    req.user = payload; 
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}
