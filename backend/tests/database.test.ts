import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import {
  initDb,
  createTables,
  closeDb,
  setAvailability,
  getAvailabilityByDate,
  getAvailabilityByMonth,
  deleteAvailability,
  createUser,
  getUserByUsername,
} from '../src/models/database';

describe('Database Module', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initDb();
    await createTables();
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
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM users', (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('setAvailability', () => {
    it('should create a new availability record', async () => {
      const result = await setAvailability('2026-01-15', 'available');
      expect(result.date).toBe('2026-01-15');
      expect(result.status).toBe('available');
      expect(result.note).toBeNull();
    });

    it('should create a record with a note', async () => {
      const result = await setAvailability('2026-01-16', 'partial', 'Available from 13:00');
      expect(result.status).toBe('partial');
      expect(result.note).toBe('Available from 13:00');
    });

    it('should update existing record', async () => {
      await setAvailability('2026-01-17', 'available');
      const updated = await setAvailability('2026-01-17', 'unavailable');
      expect(updated.status).toBe('unavailable');
    });
  });

  describe('getAvailabilityByDate', () => {
    it('should return null for non-existent date', async () => {
      const result = await getAvailabilityByDate('2026-01-99');
      expect(result).toBeNull();
    });

    it('should return availability record', async () => {
      await setAvailability('2026-01-20', 'available');
      const result = await getAvailabilityByDate('2026-01-20');
      expect(result).not.toBeNull();
      expect(result?.date).toBe('2026-01-20');
      expect(result?.status).toBe('available');
    });
  });

  describe('getAvailabilityByMonth', () => {
    it('should return all records for the month', async () => {
      await setAvailability('2026-01-01', 'available');
      await setAvailability('2026-01-15', 'unavailable');
      await setAvailability('2026-01-31', 'partial', 'Note');
      const results = await getAvailabilityByMonth(2026, 1);
      expect(results.length).toBe(3);
    });

    it('should return empty array for month with no records', async () => {
      const results = await getAvailabilityByMonth(2026, 2);
      expect(results.length).toBe(0);
    });
  });

  describe('deleteAvailability', () => {
    it('should delete existing record', async () => {
      await setAvailability('2026-01-25', 'available');
      const deleted = await deleteAvailability('2026-01-25');
      expect(deleted).toBe(true);
      const result = await getAvailabilityByDate('2026-01-25');
      expect(result).toBeNull();
    });

    it('should return false for non-existent record', async () => {
      const deleted = await deleteAvailability('2026-01-99');
      expect(deleted).toBe(false);
    });
  });

  describe('User Management', () => {
    it('should create a new user', async () => {
      const user = await createUser('testuser', 'hashedpassword', 'owner');
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('owner');
    });

    it('should get user by username', async () => {
      await createUser('testuser2', 'hashedpassword', 'neighbor');
      const user = await getUserByUsername('testuser2');
      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser2');
      expect(user?.role).toBe('neighbor');
    });

    it('should return null for non-existent user', async () => {
      const user = await getUserByUsername('nonexistent');
      expect(user).toBeNull();
    });
  });
});
