import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../models/user.model.js';
import { signToken } from '../utils/jwt.js';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are all required.' });
    }
    if (!emailRe.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, passwordHash });

    const token = signToken({ id: user.id, name: user.name, email: user.email });
    return res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const found = await findUserByEmail(email);
    if (!found) return res.status(401).json({ error: 'Invalid email or password.' });

    const ok = await bcrypt.compare(password, found.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = { id: found.id, name: found.name, email: found.email };
    const token = signToken(user);
    return res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}
