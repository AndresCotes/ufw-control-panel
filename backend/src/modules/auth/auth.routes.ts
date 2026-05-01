import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../core/middleware/auth.middleware';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.post('/login', loginLimiter, AuthController.login);
router.get('/me', authenticateJWT, (req, res) => res.json({ success: true, data: (req as any).user }));

export default router;
