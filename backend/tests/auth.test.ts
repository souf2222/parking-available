import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  generateToken,
  verifyToken,
  verifyPassword,
  hashPassword,
  authMiddleware,
  AuthRequest,
} from '../src/middleware/auth';
import { Response, NextFunction } from 'express';
import { initDb, createTables, closeDb, createUser } from '../src/models/database';

describe('Auth Middleware', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret-key';
    await initDb();
    await createTables();
    await createUser('testuser', await hashPassword('password123'), 'owner');
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('generateToken and verifyToken', () => {
    it('should generate and verify a valid token', () => {
      const payload = { id: 1, username: 'testuser', role: 'owner' };
      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const verified = verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(1);
      expect(verified?.username).toBe('testuser');
      expect(verified?.role).toBe('owner');
    });

    it('should return null for invalid token', () => {
      const verified = verifyToken('invalid-token');
      expect(verified).toBeNull();
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash password and verify correctly', async () => {
      const plainPassword = 'mysecretpassword';
      const hashedPassword = await hashPassword(plainPassword);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);

      const isValid = await verifyPassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('authMiddleware', () => {
    it('should authenticate valid Bearer token', () => {
      const payload = { id: 1, username: 'testuser', role: 'owner' };
      const token = generateToken(payload);

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user?.id).toBe(payload.id);
      expect(req.user?.username).toBe(payload.username);
      expect(req.user?.role).toBe(payload.role);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', () => {
      const req = {
        headers: {},
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
