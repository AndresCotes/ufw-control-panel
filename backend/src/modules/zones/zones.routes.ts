import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT, authorizeRoles } from '../../core/middleware/auth.middleware';
import { db } from '../../db/database';

const router = Router();
const zoneSchema = z.object({ name: z.string().min(2), description: z.string().optional(), color: z.string().optional(), icon: z.string().optional() });

router.get('/', authenticateJWT, authorizeRoles('admin', 'operator', 'viewer'), (_req, res) => {
  const rows = db.prepare('SELECT * FROM zones ORDER BY name').all();
  res.json({ success: true, data: rows });
});

router.post('/', authenticateJWT, authorizeRoles('admin', 'operator'), (req, res) => {
  const parsed = zoneSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, details: parsed.error.flatten() });
    return;
  }
  const result = db.prepare('INSERT INTO zones (name, description, color, icon) VALUES (?, ?, ?, ?)').run(parsed.data.name, parsed.data.description ?? null, parsed.data.color ?? null, parsed.data.icon ?? null);
  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});

export default router;
