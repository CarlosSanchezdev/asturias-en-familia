import { Router } from 'express';
import { body, param, query } from 'express-validator';
import Activity from '../models/Activity.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = Router();

// ─── Validaciones reutilizables ───────────────────────────
const activityValidators = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  body('description').optional().trim()
    .isLength({ max: 2000 }).withMessage('Máximo 2000 caracteres'),
  body('category').isMongoId().withMessage('Categoría inválida'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordenadas: [lng, lat]')
    .custom(([lng, lat]) => lng >= -9 && lng <= 0 && lat >= 43 && lat <= 44)
    .withMessage('Coordenadas fuera del rango de Asturias'),
  body('zone').isIn(['oriente', 'centro', 'occidente'])
    .withMessage('Zona inválida'),
  body('price').optional().isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),
  body('accessible').optional().isBoolean(),
];

// ─── GET /api/activities ──────────────────────────────────
router.get('/', [
  query('zone').optional().isIn(['oriente', 'centro', 'occidente']),
  query('category').optional().isMongoId(),
  query('accessible').optional().isBoolean(),
  query('free').optional().isBoolean(),
  query('search').optional().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const { zone, category, accessible, free, search, page, limit } = req.query;
    const filter = { active: true };

    if (zone)       filter.zone = zone;
    if (category)   filter.category = category;
    if (accessible) filter.accessible = accessible === 'true';
    if (free === 'true') filter.price = 0;

    // Búsqueda fulltext
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('category', 'name slug icon color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Activity.countDocuments(filter),
    ]);

    res.json({
      data: activities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/activities/:id ──────────────────────────────
router.get('/:id', [
  param('id').isMongoId().withMessage('ID inválido'),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, active: true })
      .populate('category', 'name slug icon color');

    if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/activities — solo admin ────────────────────
router.post('/', requireAuth, requireAdmin, activityValidators, handleValidationErrors,
  async (req, res, next) => {
    try {
      const activity = await Activity.create(req.body);
      await activity.populate('category', 'name slug icon color');
      res.status(201).json(activity);
    } catch (err) {
      next(err);
    }
  });

// ─── PUT /api/activities/:id — solo admin ─────────────────
router.put('/:id', requireAuth, requireAdmin, [
  param('id').isMongoId(),
  ...activityValidators.map((v) => v.optional()),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug icon color');

    if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/activities/:id — solo admin (soft delete) ─
router.delete('/:id', requireAuth, requireAdmin, [
  param('id').isMongoId(),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });
    res.json({ message: 'Actividad desactivada correctamente' });
  } catch (err) {
    next(err);
  }
});

export default router;
