import { db } from '../db/database';

export class AuditService {
  static log(input: {
    userId?: number;
    action: string;
    module: string;
    description?: string;
    commandExecuted?: string;
    ipAddress?: string;
    success: boolean;
  }): void {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, module, description, command_executed, ip_address, success)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.userId ?? null,
      input.action,
      input.module,
      input.description ?? null,
      input.commandExecuted ?? null,
      input.ipAddress ?? null,
      input.success ? 1 : 0
    );
  }
}
