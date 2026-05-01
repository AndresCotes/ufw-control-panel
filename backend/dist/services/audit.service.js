"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = require("../db/database");
class AuditService {
    static log(input) {
        database_1.db.prepare(`
      INSERT INTO audit_logs (user_id, action, module, description, command_executed, ip_address, success)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(input.userId ?? null, input.action, input.module, input.description ?? null, input.commandExecuted ?? null, input.ipAddress ?? null, input.success ? 1 : 0);
    }
}
exports.AuditService = AuditService;
