import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';
import {
  initDb,
  createTables,
  closeDb,
  getUserByUsername,
} from '../src/models/database';
import { hashPassword } from '../src/middleware/auth';
import { createUser } from '../src/models/database';

describe('Auth API', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key';
    await initDb();
    await createTables();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(async () => {
    const db = require('../src/models/database').getDb();
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM users', (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should require username and password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Username and password are required');
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'nonexistent', password: 'password' })
        .expect(401);
    });

    it('should return token on successful login', async () => {
      await createUser('testuser', await hashPassword('password123'), 'owner');

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.role).toBe('owner');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should require username and password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Username and password are required');
    });

    it('should reject duplicate username', async () => {
      await createUser('existinguser', await hashPassword('password123'), 'owner');

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ username: 'existinguser', password: 'password456' })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Username already exists');
    });

    it('should create new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          password: 'password789',
          role: 'neighbor',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('newuser');
      expect(response.body.user.role).toBe('neighbor');

      const dbUser = await getUserByUsername('newuser');
      expect(dbUser).not.toBeNull();
    });
  });
});
