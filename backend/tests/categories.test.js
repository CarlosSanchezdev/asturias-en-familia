import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';

let adminToken = '';
let categoryId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/asturias-test');

  const exists = await User.findOne({ email: 'admin@asturias-familia.es' });
  if (!exists) {
    const passwordHash = await User.hashPassword('Admin1234');
    await User.create({ email: 'admin@asturias-familia.es', passwordHash, role: 'admin' });
  }

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@asturias-familia.es', password: 'Admin1234' });
  adminToken = loginRes.body.accessToken;
}, 30000);

afterAll(async () => {
  await mongoose.connection.collection('categories').deleteMany({ slug: /test-jest/ });
  await mongoose.connection.collection('users').deleteMany({ email: /visitor-cat/ });
  await mongoose.disconnect();
});

describe('GET /api/categories', () => {
  it('devuelve 200 con array de categorías activas', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('con ?all=true devuelve todas incluidas inactivas', async () => {
    const res = await request(app).get('/api/categories?all=true');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/categories — admin', () => {
  it('crea categoría correctamente → 201', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Jest Cat',
        slug: `test-jest-${Date.now()}`,
        icon: 'test.svg',
        color: '#FF0000',
        order: 99,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    categoryId = res.body._id;
  }, 10000);

  it('devuelve 401 sin token', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Test', slug: 'test', icon: 'test.svg', color: '#000000' });
    expect(res.status).toBe(401);
  });

  it('devuelve 403 con token visitor', async () => {
    const email = `visitor-cat-${Date.now()}@test.com`;
    await request(app).post('/api/auth/register').send({ email, password: 'Visitor1234' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'Visitor1234' });
    const visitorToken = loginRes.body.accessToken;

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${visitorToken}`)
      .send({ name: 'Test', slug: 'test', icon: 'test.svg', color: '#000000' });
    expect(res.status).toBe(403);
  }, 20000);

  it('devuelve 400 con color inválido', async () => {
    // express-validator rechaza el color antes de llegar a Mongoose → 400
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test', slug: 'test-invalid', icon: 'test.svg', color: 'rojo' });
    expect(res.status).toBe(400);
  }, 10000);

  it('devuelve 409 si el slug ya existe', async () => {
    // Slug duplicado → índice unique de MongoDB → errorHandler → 409
    const slug = `test-jest-dup-${Date.now()}`;
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Dup A', slug, icon: 'test.svg', color: '#000000' });
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Dup B', slug, icon: 'test.svg', color: '#000000' });
    expect(res.status).toBe(409);
  }, 15000);
});

describe('GET /api/categories/:id', () => {
  it('devuelve la categoría por id → 200', async () => {
    const res = await request(app).get(`/api/categories/${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(categoryId);
  }, 10000);

  it('devuelve 404 si el id es válido pero no existe', async () => {
    const res = await request(app).get('/api/categories/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('devuelve 400 con id de formato inválido', async () => {
    // Sin param validator en la ruta, Mongoose lanza CastError → errorHandler → 400
    const res = await request(app).get('/api/categories/id-invalido');
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/categories/:id — admin', () => {
  it('actualiza categoría correctamente → 200', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Jest Actualizada' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Jest Actualizada');
  }, 10000);

  it('devuelve 401 sin token', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .send({ name: 'test' });
    expect(res.status).toBe(401);
  });

  it('devuelve 404 con id inexistente', async () => {
    const res = await request(app)
      .put('/api/categories/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'test' });
    expect(res.status).toBe(404);
  }, 10000);

  it('devuelve 400 con id de formato inválido', async () => {
    // param('id').isMongoId() → handleValidationErrors → 400
    const res = await request(app)
      .put('/api/categories/id-invalido')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'test' });
    expect(res.status).toBe(400);
  }, 10000);
});
