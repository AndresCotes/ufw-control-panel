import { Router } from 'express';
import { authenticateJWT } from '../../core/middleware/auth.middleware';
import { db } from '../../db/database';
import { UfwCommandService } from '../../services/ufw-command.service';
import { parseUfwNumbered } from '../../core/utils/ufw';

const router = Router();

router.get('/summary', authenticateJWT, async (_req, res) => {
  const users = db.prepare('SELECT COUNT(*) as total FROM users').get() as any;
  const audits = db.prepare('SELECT COUNT(*) as total FROM audit_logs').get() as any;
  const latest = db.prepare('SELECT action, module, created_at, success FROM audit_logs ORDER BY id DESC LIMIT 8').all();

  const numbered = await UfwCommandService.run(['status', 'numbered']);
  const verbose = await UfwCommandService.run(['status', 'verbose']);
  const parsedRules = numbered.code === 0 ? parseUfwNumbered(numbered.stdout) : [];

  const countBy = (key: string) => parsedRules.filter((r) => r.action.toUpperCase().includes(key)).length;
  const ufwActive = /Status:\s+active/i.test(verbose.stdout);

  res.json({
    success: true,
    data: {
      ufwActive,
      totalRules: parsedRules.length,
      allowRules: countBy('ALLOW'),
      denyRules: countBy('DENY'),
      rejectRules: countBy('REJECT'),
      limitRules: countBy('LIMIT'),
      users: users.total,
      audits: audits.total,
      latestActions: latest,
      ufwVerboseRaw: verbose.stdout
    }
  });
});

export default router;
