import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';
import {
  initDb,
  createTables,
  closeDb,
  setAvailability,
  createUser,
} from '../src/models/database';
import { generateToken, hashPassword } from '../src/middleware/auth';

describe('Availability API', () => {
  let ownerToken: string;
  let ownerUser: { id: number; username: string; role: string };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key';
    await initDb();
    await createTables();
    await createUser('owner', await hashPassword('password123'), 'owner');
    ownerUser = { id: 1, username: 'owner', role: 'owner' };
    ownerToken = generateToken(ownerUser);
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(async () => {
    const db = require('../src/models/database').getDb();
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM availability', (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('GET /api/v1/availability/:year/:month', () => {
    it('should return empty array for month with no data', async () => {
      const response = await request(app)
        .get('/api/v1/availability/2026/01')
        .expect(200);

      expect(response.body).toHaveProperty('availability');
      expect(Array.isArray(response.body.availability)).toBe(true);
    });

    it('should return availability records for the month', async () => {
      await setAvailability('2026-01-15', 'available');
      await setAvailability('2026-01-20', 'unavailable');

      const response = await request(app)
        .get('/api/v1/availability/2026/01')
        .expect(200);

      expect(response.body.availability.length).toBe(2);
    });

    it('should return 400 for invalid month', async () => {
      const response = await request(app)
        .get('/api/v1/availability/2026/13')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid year or month');
    });
  });

  describe('GET /api/v1/availability/:date', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/availability/2026-01-15')
        .expect(401);
    });

    it('should return 404 for non-existent date', async () => {
      const response = await request(app)
        .get('/api/v1/availability/2026-01-99')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Availability not found');
    });

    it('should return availability record for existing date', async () => {
      await setAvailability('2026-01-15', 'available', 'Note here');

      const response = await request(app)
        .get('/api/v1/availability/2026-01-15')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('availability');
      expect(response.body.availability.date).toBe('2026-01-15');
      expect(response.body.availability.status).toBe('available');
    });
  });

  describe('POST /api/v1/availability', () => {
    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/availability')
        .send({ date: '2026-01-15', status: 'available' })
        .expect(401);
    });

    it('should require date and status', async () => {
      const response = await request(app)
        .post('/api/v1/availability')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Date and status are required');
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .post('/api/v1/availability')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ date: '2026-01-15', status: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should create availability record', async () => {
      const response = await request(app)
        .post('/api/v1/availability')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ date: '2026-01-20', status: 'available', note: 'Test note' })
        .expect(201);

      expect(response.body).toHaveProperty('availability');
      expect(response.body.availability.date).toBe('2026-01-20');
      expect(response.body.availability.status).toBe('available');
      expect(response.body.availability.note).toBe('Test note');
    });
  });

  describe('DELETE /api/v1/availability/:date', () => {
    it('should require authentication', async () => {
      await request(app)
        .delete('/api/v1/availability/2026-01-15')
        .expect(401);
    });

    it('should return 404 for non-existent record', async () => {
      await request(app)
        .delete('/api/v1/availability/2026-01-99')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });

    it('should delete existing record', async () => {
      await setAvailability('2026-01-25', 'available');

      await request(app)
        .delete('/api/v1/availability/2026-01-25')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const getResponse = await request(app)
        .get('/api/v1/availability/2026-01-25')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });
  });
});
