import { Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = Router();

/** Genera el access token (15 min) */
function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

/** Genera el refresh token (7 días) */
function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

// ─── POST /api/auth/register ──────────────────────────────
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número'),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash });

    const accessToken  = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(201).json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Recuperamos incluyendo el hash (campo con select:false)
    const user = await User.findOne({ email, active: true }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Actualizamos último login
    user.lastLogin = new Date();
    await user.save();

    const accessToken  = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/refresh ───────────────────────────────
router.post('/refresh', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    const accessToken  = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
