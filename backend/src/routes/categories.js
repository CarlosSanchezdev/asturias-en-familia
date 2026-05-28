import { Router } from 'express';
import { body, param } from 'express-validator';
import Category from '../models/Category.js';
import Activity from '../models/Activity.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { active: true };
    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 })
      .lean();
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
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
    if (req.body.active === false) {
      const count = await Activity.countDocuments({ category: req.params.id, active: true });
      if (count > 0) {
        return res.status(409).json({
          error: `No se puede desactivar: hay ${count} actividad${count === 1 ? '' : 'es'} activa${count === 1 ? '' : 's'} con esta categoría`,
        });
      }
    }
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
