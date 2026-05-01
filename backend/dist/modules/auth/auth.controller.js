"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_schema_1 = require("./auth.schema");
const auth_service_1 = require("./auth.service");
const audit_service_1 = require("../../services/audit.service");
class AuthController {
    static login(req, res) {
        const parsed = auth_schema_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, message: 'Invalid payload', details: parsed.error.flatten() });
            return;
        }
        const result = auth_service_1.AuthService.login(parsed.data);
        if (!result) {
            audit_service_1.AuditService.log({ action: 'LOGIN_FAILED', module: 'auth', description: `Failed login for ${parsed.data.email}`, ipAddress: req.ip, success: false });
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        audit_service_1.AuditService.log({ userId: result.user.id, action: 'LOGIN_SUCCESS', module: 'auth', description: `Login success for ${result.user.email}`, ipAddress: req.ip, success: true });
        res.json({ success: true, message: 'Login success', data: result });
    }
}
exports.AuthController = AuthController;
