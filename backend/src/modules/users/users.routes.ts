import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authenticateJWT, authorizeRoles } from '../../core/middleware/auth.middleware';
import { db } from '../../db/database';

const router = Router();
const createSchema = z.object({ name: z.string().min(2), email: z.string().min(3), password: z.string().min(8), role: z.enum(['admin', 'operator', 'viewer']) });

router.get('/', authenticateJWT, authorizeRoles('admin'), (_req, res) => {
  const rows = db.prepare('SELECT id, name, email, role, active, created_at FROM users ORDER BY id DESC').all();
  res.json({ success: true, data: rows });
});

router.post('/', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, details: parsed.error.flatten() });
    return;
  }
  const hash = bcrypt.hashSync(parsed.data.password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, 1)').run(parsed.data.name, parsed.data.email, hash, parsed.data.role);
  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});

export default router;
