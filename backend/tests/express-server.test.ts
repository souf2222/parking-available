import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';

describe('Express Server', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1', () => {
    it('should return API message', async () => {
      const response = await request(app).get('/api/v1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Parking Available API');
    });
  });

  describe('Error Handler', () => {
    it('should return 500 for unhandled errors', async () => {
      app.get('/error', () => {
        throw new Error('Test error');
      });
      const response = await request(app).get('/error');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });
  });
});
