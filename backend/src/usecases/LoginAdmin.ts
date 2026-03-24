import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { AppError, UnauthorizedError } from '../errors/index.js';
import pool from '../lib/db.js';

interface InputDto {
  email: string;
  senha: string;
}

interface OutputDto {
  token: string;
}

interface AdminRow {
  id: string;
  email: string;
  password: string;
}

export class LoginAdmin {
  async execute({ email, senha }: InputDto): Promise<OutputDto> {
    const result = await pool.query(
      'SELECT id, email, password FROM admins WHERE email = $1',
      [email],
    );

    const admin = result.rows[0] as AdminRow | undefined;

    if (!admin) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isSenhaValida = await bcrypt.compare(senha, admin.password);

    if (!isSenhaValida) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new AppError('JWT_SECRET não configurado', 500, 'CONFIGURATION_ERROR');
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, secret, {
      expiresIn: '1d',
    });

    return { token };
  }
}
