import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asturias-test';

const testEmail = `test-jest-${Date.now()}@test.com`;
const testPassword = 'TestPass1';
let accessToken = '';

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
}, 30000);

afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({ email: /test-jest/ });
  await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
  it('registra un usuario nuevo y devuelve 201 con tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user).not.toHaveProperty('passwordHash');
  }, 10000);

  it('devuelve 409 si el email ya está registrado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(409);
  }, 10000);

  it('devuelve 400 si la contraseña no tiene mayúscula', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'otro@test.com', password: 'sinmayuscula1' });
    expect(res.status).toBe(400);
  });

  it('devuelve 400 si la contraseña no tiene número', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'otro@test.com', password: 'SinNumero' });
    expect(res.status).toBe(400);
  });

  it('devuelve 400 si la contraseña tiene menos de 8 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'otro@test.com', password: 'Ab1' });
    expect(res.status).toBe(400);
  });

  it('devuelve 400 si el email es inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'noesemail', password: testPassword });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('devuelve 200 con tokens si las credenciales son correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
  }, 10000);

  it('devuelve 401 si la contraseña es incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });

  it('devuelve 401 si el email no existe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: testPassword });
    expect(res.status).toBe(401);
  });

  it('no expone passwordHash en la respuesta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  }, 10000);
});

describe('GET /api/auth/me', () => {
  it('devuelve 200 con datos del usuario si el token es válido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    // /me devuelve el usuario directamente en res.body (no anidado)
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testEmail);
    expect(res.body).not.toHaveProperty('passwordHash');
  }, 10000);

  it('devuelve 401 sin token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('devuelve 401 con token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer tokeninvalido');
    expect(res.status).toBe(401);
  });
});
