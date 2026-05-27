import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';

// Mock de Mongoose para no necesitar BD real en tests
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(undefined),
    connection: { readyState: 1 },
  };
});

jest.mock('../src/models/Activity.js', () => ({
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

import Activity from '../src/models/Activity.js';

describe('GET /api/activities', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devuelve lista vacía si no hay actividades', async () => {
    Activity.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });
    Activity.countDocuments.mockResolvedValue(0);

    const res = await request(app).get('/api/activities');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('devuelve 400 con zona inválida', async () => {
    const res = await request(app).get('/api/activities?zone=norte');
    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('responde 200 con status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
