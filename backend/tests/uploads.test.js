import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';

let adminToken = '';

beforeAll(async () => {
    await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27018/asturias-test'
    );

    const passwordHash = await User.hashPassword('Admin1234');
    await User.findOneAndUpdate(
        { email: 'admin@asturias-familia.es' },
        { $setOnInsert: { passwordHash, role: 'admin', active: true } },
        { upsert: true, new: true }
    );

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@asturias-familia.es', password: 'Admin1234' });
    adminToken = loginRes.body.accessToken;
}, 30000);

afterAll(async () => {
    await mongoose.disconnect();
});

describe('POST /api/uploads/icon', () => {
    it('devuelve 401 sin token', async () => {
        const res = await request(app).post('/api/uploads/icon');
        expect(res.status).toBe(401);
    });

    it('devuelve 400 con token admin pero sin archivo', async () => {
        const res = await request(app)
            .post('/api/uploads/icon')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(400);
    }, 10000);
});

describe('POST /api/uploads/activity-image', () => {
    it('devuelve 401 sin token', async () => {
        const res = await request(app).post('/api/uploads/activity-image');
        expect(res.status).toBe(401);
    });

    it('devuelve 400 con token admin pero sin archivo', async () => {
        const res = await request(app)
            .post('/api/uploads/activity-image')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(400);
    }, 10000);
});