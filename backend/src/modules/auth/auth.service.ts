import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../db/database';
import { env } from '../../config/env';
import { LoginDto } from './auth.schema';

export class AuthService {
  static login(payload: LoginDto) {
    const user = db
      .prepare('SELECT id, name, email, password_hash, role, active FROM users WHERE email = ?')
      .get(payload.email) as any;

    if (!user || !user.active || !bcrypt.compareSync(payload.password, user.password_hash)) {
      return null;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as any
    });

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
