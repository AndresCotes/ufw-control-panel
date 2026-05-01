import app from './app';
import { env } from './config/env';
import { runMigrations } from './db/database';

runMigrations();
app.listen(env.port, env.host, () => {
  console.log(`Backend listening on http://${env.host}:${env.port}`);
});
