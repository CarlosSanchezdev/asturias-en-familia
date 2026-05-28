import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asturias-test';

// Conectar antes de todos los tests
beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
}, 15000);

// Desconectar después de todos los tests
afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /health', () => {
  it('responde 200 con status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/categories', () => {
  it('responde 200 con un array', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 10000);
});

describe('GET /api/activities', () => {
  it('responde 200 con data y pagination', async () => {
    const res = await request(app).get('/api/activities');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
  }, 10000);

  it('ignora parámetros de zona desconocidos y devuelve 200', async () => {
    const res = await request(app).get('/api/activities?zone=norte');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

describe('POST /api/activities sin token', () => {
  it('devuelve 401', async () => {
    const res = await request(app).post('/api/activities').send({});
    expect(res.status).toBe(401);
  });
});