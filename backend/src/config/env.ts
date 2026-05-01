import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'unsafe-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  dbClient: process.env.DB_CLIENT || 'sqlite',
  sqlitePath: process.env.SQLITE_PATH || './data/ufw-control-panel.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@local',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123!',
  ufwContainerName: process.env.UFW_CONTAINER_NAME || ''
};
