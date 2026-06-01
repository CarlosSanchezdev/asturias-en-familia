import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asturias-test';

let adminToken = '';
let categoryId = '';
let activityId = '';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27018/asturias-test');

  // Crear admin de test si no existe
  const exists = await User.findOne({ email: 'admin@asturias-familia.es' });
  if (!exists) {
    const passwordHash = await User.hashPassword('Admin1234');
    await User.create({
      email: 'admin@asturias-familia.es',
      passwordHash,
      role: 'admin'
    });
  }

  // Crear categoría de test si no existe
  let cat = await Category.findOne({ slug: 'test-cat' });
  if (!cat) {
    cat = await Category.create({
      name: 'Test', slug: 'test-cat',
      icon: 'test.svg', color: '#000000',
      order: 99, active: true
    });
  }
  categoryId = cat._id.toString();

  // Login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@asturias-familia.es', password: 'Admin1234' });
  adminToken = loginRes.body.accessToken;
}, 30000);

afterAll(async () => {
  await mongoose.connection.collection('activities').deleteMany({ name: /test-jest/ });
  await mongoose.connection.collection('users').deleteMany({ email: /visitor-jest/ });
  await mongoose.disconnect();
});

const validActivity = () => ({
  name: `test-jest-actividad-${Date.now()}`,
  description: 'Descripción de prueba',
  category: categoryId,
  location: {
    type: 'Point',
    coordinates: [-5.8447, 43.3614],  // Oviedo — dentro del rango de Asturias
  },
  zone: 'centro',
  free: true,
  accessible: false,
  languages: ['es'],
});

describe('POST /api/activities — admin', () => {
  it('crea actividad correctamente con token admin → 201', async () => {
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validActivity());
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.active).toBe(true);
    activityId = res.body._id;
  }, 10000);

  it('calcula mapLeft y mapTop automáticamente en el pre-save hook', async () => {
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validActivity());
    expect(res.status).toBe(201);
    expect(res.body.mapLeft).toBeDefined();
    expect(res.body.mapTop).toBeDefined();
    expect(res.body.mapLeft).toBeGreaterThan(0);
    expect(res.body.mapTop).toBeGreaterThan(0);
  }, 10000);

  it('devuelve 401 sin token', async () => {
    const res = await request(app)
      .post('/api/activities')
      .send(validActivity());
    expect(res.status).toBe(401);
  });

  it('devuelve 403 con token de usuario visitor', async () => {
    const email = `visitor-jest-${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'Visitor1234' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Visitor1234' });
    const visitorToken = loginRes.body.accessToken;

    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${visitorToken}`)
      .send(validActivity());
    expect(res.status).toBe(403);
  }, 20000);

  it('devuelve 400 con coordenadas fuera de Asturias', async () => {
    const act = validActivity();
    act.location.coordinates = [-3.7, 40.4];  // Madrid
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(act);
    expect(res.status).toBe(400);
  }, 10000);

  it('devuelve 422 sin nombre', async () => {
    const act = validActivity();
    delete act.name;
    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(act);
    expect(res.status).toBe(422);
  }, 10000);
});

describe('PUT /api/activities/:id — admin', () => {
  it('actualiza actividad correctamente → 200', async () => {
    const res = await request(app)
      .put(`/api/activities/${activityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'test-jest-actualizada' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('test-jest-actualizada');
  }, 10000);

  it('devuelve 400 con ID de formato inválido', async () => {
    const res = await request(app)
      .put('/api/activities/id-invalido')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'test' });
    expect(res.status).toBe(400);
  }, 10000);

  it('devuelve 401 sin token', async () => {
    const res = await request(app)
      .put(`/api/activities/${activityId}`)
      .send({ name: 'test' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/activities/:id — soft delete', () => {
  it('desactiva actividad correctamente → 200', async () => {
    const res = await request(app)
      .delete(`/api/activities/${activityId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Actividad desactivada correctamente');
  }, 10000);

  it('la actividad desactivada no aparece en GET /api/activities', async () => {
    const res = await request(app).get('/api/activities');
    expect(res.status).toBe(200);
    const ids = res.body.data.map(a => a._id);
    expect(ids).not.toContain(activityId);
  }, 10000);

  it('devuelve 401 sin token', async () => {
    const res = await request(app)
      .delete(`/api/activities/${activityId}`);
    expect(res.status).toBe(401);
  });
});
