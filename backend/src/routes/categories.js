import { Router } from 'express';
import { body, param } from 'express-validator';
import Category from '../models/Category.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/categories
router.get('/', async (_req, res, next) => {
  try {
    const categories = await Category.find({ active: true })
      .sort({ order: 1, name: 1 })
      .lean();
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories — solo admin
router.post('/', requireAuth, requireAdmin, [
  body('name').trim().notEmpty().isLength({ max: 50 }),
  body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/),
  body('icon').trim().notEmpty(),
  body('color').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color hexadecimal inválido'),
  body('description').optional().trim().isLength({ max: 200 }),
  body('order').optional().isInt({ min: 0 }),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id — solo admin
router.put('/:id', requireAuth, requireAdmin, [
  param('id').isMongoId(),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

export default router;
