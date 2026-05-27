import { validationResult } from 'express-validator';

/**
 * Manejador de errores global de Express 5
 * Debe registrarse como último middleware en server.js
 */
export function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({ error: 'Datos inválidos', details: errors });
  }

  // Clave duplicada en MongoDB (email, slug…)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Ya existe un registro con ese ${field}` });
  }

  // ObjectId inválido
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Identificador no válido' });
  }

  // Error genérico
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;

  res.status(status).json({ error: message });
}

/**
 * Middleware que lee los errores de express-validator y
 * devuelve 400 si hay alguno, o continúa al siguiente handler.
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}
