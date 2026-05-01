import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import firewallRoutes from './modules/firewall/firewall.routes';
import usersRoutes from './modules/users/users.routes';
import zonesRoutes from './modules/zones/zones.routes';
import rulesRoutes from './modules/rules/rules.routes';
import auditRoutes from './modules/audit/audit.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { errorHandler } from './core/middleware/error.middleware';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.get('/health', (_req, res) => res.json({ success: true, message: 'backend alive' }));
app.use('/api/auth', authRoutes);
app.use('/api/firewall', firewallRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(errorHandler);

export default app;
