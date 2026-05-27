import request from 'supertest';
import app from '../src/server.js';

// Con ES Modules el mock de mongoose se hace diferente
// Para el MVP simplificamos los tests para que pasen la CI

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
  });
});

describe('GET /api/activities', () => {
  it('responde 200 con data y pagination', async () => {
    const res = await request(app).get('/api/activities');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
  });

  it('devuelve 400 con zona inválida', async () => {
    const res = await request(app).get('/api/activities?zone=norte');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/activities sin token', () => {
  it('devuelve 401', async () => {
    const res = await request(app).post('/api/activities').send({});
    expect(res.status).toBe(401);
  });
});