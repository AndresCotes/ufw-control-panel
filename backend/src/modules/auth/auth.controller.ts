import { Request, Response } from 'express';
import { loginSchema } from './auth.schema';
import { AuthService } from './auth.service';
import { AuditService } from '../../services/audit.service';

export class AuthController {
  static login(req: Request, res: Response): void {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid payload', details: parsed.error.flatten() });
      return;
    }

    const result = AuthService.login(parsed.data);
    if (!result) {
      AuditService.log({ action: 'LOGIN_FAILED', module: 'auth', description: `Failed login for ${parsed.data.email}`, ipAddress: req.ip, success: false });
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    AuditService.log({ userId: result.user.id, action: 'LOGIN_SUCCESS', module: 'auth', description: `Login success for ${result.user.email}`, ipAddress: req.ip, success: true });
    res.json({ success: true, message: 'Login success', data: result });
  }
}
