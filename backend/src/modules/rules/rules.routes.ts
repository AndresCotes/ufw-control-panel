import { Router } from 'express';
import { z } from 'zod';
import { authenticateJWT, authorizeRoles, AuthRequest } from '../../core/middleware/auth.middleware';
import { UfwCommandService } from '../../services/ufw-command.service';
import { AuditService } from '../../services/audit.service';
import { buildUfwRuleArgs, parseUfwNumbered } from '../../core/utils/ufw';
import { db } from '../../db/database';

const router = Router();

const createRuleSchema = z.object({
  action: z.enum(['allow', 'deny', 'reject', 'limit']),
  direction: z.enum(['in', 'out', 'any']).optional(),
  interfaceName: z.string().max(32).optional(),
  sourceIp: z.string().optional(),
  destinationIp: z.string().optional(),
  port: z.string().min(1),
  protocol: z.enum(['tcp', 'udp', 'any']).optional(),
  comment: z.string().max(180).optional(),
  zoneId: z.number().optional()
});

router.get('/', authenticateJWT, authorizeRoles('admin', 'operator', 'viewer'), async (_req, res) => {
  const status = await UfwCommandService.run(['status', 'numbered']);
  const rules = status.code === 0 ? parseUfwNumbered(status.stdout) : [];
  res.json({ success: true, data: { rules, raw: status.stdout, stderr: status.stderr, ufwOk: status.code === 0 } });
});

router.post('/preview', authenticateJWT, authorizeRoles('admin', 'operator'), (req, res) => {
  const parsed = createRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid payload', details: parsed.error.flatten() });
    return;
  }

  try {
    const built = buildUfwRuleArgs(parsed.data);
    res.json({ success: true, data: built });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Invalid rule input' });
  }
});

router.post('/', authenticateJWT, authorizeRoles('admin', 'operator'), async (req: AuthRequest, res) => {
  const parsed = createRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid payload', details: parsed.error.flatten() });
    return;
  }

  try {
    const built = buildUfwRuleArgs(parsed.data);
    const result = await UfwCommandService.run(built.args);

    AuditService.log({
      userId: req.user?.id,
      action: 'RULE_CREATE',
      module: 'rules',
      description: `Created firewall rule action=${parsed.data.action} port=${parsed.data.port}`,
      commandExecuted: built.commandPreview,
      ipAddress: req.ip,
      success: result.code === 0
    });

    if (result.code !== 0) {
      res.status(400).json({ success: false, message: 'UFW command failed', data: result });
      return;
    }

    db.prepare(`
      INSERT INTO firewall_rules (action, protocol, port, source_ip, destination_ip, comment, zone_id, enabled, raw_command, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      parsed.data.action,
      parsed.data.protocol ?? 'any',
      parsed.data.port,
      parsed.data.sourceIp ?? 'any',
      parsed.data.destinationIp ?? 'any',
      parsed.data.comment ?? null,
      parsed.data.zoneId ?? null,
      built.commandPreview,
      req.user?.id ?? null
    );

    res.status(201).json({ success: true, message: 'Rule created', data: { command: built.commandPreview, ufw: result } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Rule creation failed' });
  }
});

router.delete('/:ufwNumber', authenticateJWT, authorizeRoles('admin', 'operator'), async (req: AuthRequest, res) => {
  const ufwNumber = Number(req.params.ufwNumber);
  if (!Number.isInteger(ufwNumber) || ufwNumber <= 0) {
    res.status(400).json({ success: false, message: 'Invalid rule number' });
    return;
  }

  const result = await UfwCommandService.run(['--force', 'delete', String(ufwNumber)]);

  AuditService.log({
    userId: req.user?.id,
    action: 'RULE_DELETE',
    module: 'rules',
    description: `Deleted firewall rule #${ufwNumber}`,
    commandExecuted: `ufw --force delete ${ufwNumber}`,
    ipAddress: req.ip,
    success: result.code === 0
  });

  if (result.code !== 0) {
    res.status(400).json({ success: false, message: 'Unable to delete rule', data: result });
    return;
  }

  db.prepare('UPDATE firewall_rules SET enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE ufw_number = ?').run(ufwNumber);

  res.json({ success: true, message: `Rule ${ufwNumber} deleted`, data: result });
});

export default router;
