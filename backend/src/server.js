import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import activitiesRouter from './routes/activities.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware global ─────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));

// ─── Rutas ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/activities', activitiesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);

// Ruta no encontrada
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores (siempre al final)
app.use(errorHandler);

// ─── Conexión MongoDB ──────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado:', process.env.MONGODB_URI);
  } catch (err) {
    console.error('❌ Error conectando MongoDB:', err.message);
    process.exit(1);
  }
}

// ─── Arranque ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
  });
}

export default app;
