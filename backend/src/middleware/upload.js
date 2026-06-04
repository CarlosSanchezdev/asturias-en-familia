import multer from 'multer';
import path from 'path';
import fs from 'fs';

function createStorage(dir, prefix) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${prefix}-${Date.now()}${ext}`);
    },
  });
}

const imageFilter = (_req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes PNG, JPG, SVG o WebP'));
};

export const uploadIcon = multer({
  storage: createStorage('uploads/icons', 'icon'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const uploadActivityImage = multer({
  storage: createStorage('uploads/activities', 'activity'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB para fotos
});
