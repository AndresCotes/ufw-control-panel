import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../../core/middleware/auth.middleware';
import { db } from '../../db/database';

const router = Router();
router.get('/', authenticateJWT, authorizeRoles('admin', 'operator', 'viewer'), (_req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200').all();
  res.json({ success: true, data: logs });
});

export default router;
