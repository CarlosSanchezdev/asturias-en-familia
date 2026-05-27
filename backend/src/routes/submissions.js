import { Router } from 'express';
import { body, param, query } from 'express-validator';
import PendingActivity from '../models/PendingActivity.js';
import Activity from '../models/Activity.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/errorHandler.js';

const router = Router();

// POST /api/submissions — formulario público
router.post('/', [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
  body('shortDescription').trim().notEmpty().isLength({ max: 300 }),
  body('contactName').trim().notEmpty().withMessage('El nombre de contacto es obligatorio'),
  body('contactEmail').isEmail().normalizeEmail().withMessage('Email de contacto inválido'),
  body('zone').optional().isIn(['oriente', 'centro', 'occidente']),
  body('contactPhone').optional().trim(),
  body('municipality').optional().trim(),
  body('additionalInfo').optional().trim().isLength({ max: 1000 }),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const submission = await PendingActivity.create(req.body);
    res.status(201).json({ message: 'Solicitud enviada correctamente', id: submission._id });
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions — solo admin
router.get('/', requireAuth, requireAdmin, [
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const submissions = await PendingActivity.find(filter).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions/:id — solo admin
router.get('/:id', requireAuth, requireAdmin, [
  param('id').isMongoId(),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const submission = await PendingActivity.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json(submission);
  } catch (err) {
    next(err);
  }
});

// PUT /api/submissions/:id/approve — admin aprueba
router.put('/:id/approve', requireAuth, requireAdmin, [
  param('id').isMongoId(),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const submission = await PendingActivity.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Solicitud no encontrada' });
    if (submission.status !== 'pending') {
      return res.status(400).json({ error: 'Esta solicitud ya fue procesada' });
    }
    // Marcar como aprobada
    submission.status = 'approved';
    await submission.save();
    res.json({ message: 'Solicitud aprobada. Crea la actividad desde el panel admin.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/submissions/:id/reject — admin rechaza
router.put('/:id/reject', requireAuth, requireAdmin, [
  param('id').isMongoId(),
  body('adminNotes').optional().trim().isLength({ max: 500 }),
  handleValidationErrors,
], async (req, res, next) => {
  try {
    const submission = await PendingActivity.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', adminNotes: req.body.adminNotes },
      { new: true }
    );
    if (!submission) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json({ message: 'Solicitud rechazada' });
  } catch (err) {
    next(err);
  }
});

export default router;
