import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.js';
import { findUserByEmail, createUser } from '../user/user.query.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

router.post('/register', async (req, res) => {
  const { email, password, name, firstname } = req.body || {};
  if (!email || !password || !name || !firstname)
    return res.status(400).json({ error: 'email, password, name, firstname requis' });

  const exists = await findUserByEmail(email);
  if (exists) return res.status(409).json({ error: 'Email déjà utilisé' });

  const hash = await bcrypt.hash(password, 10);
  const user = await createUser({ email, passwordHash: hash, name, firstname });
  const token = signToken(user);
  res.status(201).json({ user: { id: user.id, email, name, firstname }, token });
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email et password requis' });

  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

  const token = signToken(user);
  res.json({ user: { id: user.id, email: user.email, name: user.name, firstname: user.firstname }, token });
});

export default router;
