import { Router } from 'express';
import { uploadIcon, uploadActivityImage } from '../middleware/upload.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/icon', requireAuth, requireAdmin,
  uploadIcon.single('icon'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
    res.json({
      filename: req.file.filename,
      url: `/uploads/icons/${req.file.filename}`,
    });
  }
);

router.post('/activity-image', requireAuth, requireAdmin,
  uploadActivityImage.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
    res.json({
      filename: req.file.filename,
      url: `/uploads/activities/${req.file.filename}`,
    });
  }
);

export default router;
