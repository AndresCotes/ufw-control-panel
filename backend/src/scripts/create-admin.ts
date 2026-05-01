import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { db, runMigrations } from '../db/database';

runMigrations();
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(env.adminEmail) as any;
if (existing) {
  console.log(`Admin user already exists with email ${env.adminEmail}`);
  process.exit(0);
}

const hash = bcrypt.hashSync(env.adminPassword, 10);
const result = db.prepare('INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, 1)').run('System Admin', env.adminEmail, hash, 'admin');
console.log(`Admin created with id ${result.lastInsertRowid} and email ${env.adminEmail}`);
