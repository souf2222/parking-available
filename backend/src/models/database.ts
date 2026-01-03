import sqlite3, { Database, RunResult } from 'sqlite3';
import path from 'path';

const DB_PATH: string = path.resolve(process.cwd(), 'data', 'parking.db');

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export function initDb(): Promise<Database> {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db as Database);
    });
  });
}

export async function createTables(): Promise<void> {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      database.run(
        `CREATE TABLE IF NOT EXISTS availability (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'unavailable',
          note TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
        }
      );
      database.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'owner'
        )`,
        (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  });
}

export function closeDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        db = null;
        resolve();
      }
    });
  });
}

export interface Availability {
  id: number;
  date: string;
  status: 'available' | 'unavailable' | 'partial';
  note: string | null;
  created_at: string;
  updated_at: string;
}

export async function setAvailability(
  date: string,
  status: 'available' | 'unavailable' | 'partial',
  note?: string
): Promise<Availability> {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.run(
      `INSERT INTO availability (date, status, note)
       VALUES (?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         status = excluded.status,
         note = excluded.note,
         updated_at = CURRENT_TIMESTAMP`,
      [date, status, note || null],
      function(this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          database.get(
            'SELECT * FROM availability WHERE date = ?',
            [date],
            (err: Error | null, row: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(row as Availability);
              }
            }
          );
        }
      }
    );
  });
}

export async function getAvailabilityByDate(date: string): Promise<Availability | null> {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.get(
      'SELECT * FROM availability WHERE date = ?',
      [date],
      (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? (row as Availability) : null);
        }
      }
    );
  });
}

export async function getAvailabilityByMonth(year: number, month: number): Promise<Availability[]> {
  const database = getDb();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  return new Promise((resolve, reject) => {
    database.all(
      'SELECT * FROM availability WHERE date >= ? AND date <= ? ORDER BY date',
      [startDate, endDate],
      (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Availability[]);
        }
      }
    );
  });
}

export async function deleteAvailability(date: string): Promise<boolean> {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.run(
      'DELETE FROM availability WHERE date = ?',
      [date],
      function(this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      }
    );
  });
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'owner' | 'neighbor';
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? (row as User) : null);
        }
      }
    );
  });
}

export async function createUser(
  username: string,
  password: string,
  role: 'owner' | 'neighbor' = 'owner'
): Promise<User> {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role],
      function(this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          database.get(
            'SELECT * FROM users WHERE id = ?',
            [this.lastID],
            (err: Error | null, row: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(row as User);
              }
            }
          );
        }
      }
    );
  });
}
