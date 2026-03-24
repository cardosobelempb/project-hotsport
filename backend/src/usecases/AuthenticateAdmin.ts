import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db.js';
import { UnauthorizedError } from '../errors/index.js';

interface InputDto {
  email: string;
  senha: string;
}

interface OutputDto {
  token: string;
}

export class AuthenticateAdmin {
  async execute({ email, senha }: InputDto): Promise<OutputDto> {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isSenhaValida = await bcrypt.compare(senha, admin.password);

    if (!isSenhaValida) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const secret = process.env['JWT_SECRET'] ?? 'chave_secreta_muito_forte';
    const token = jwt.sign({ id: admin.id, email: admin.email }, secret, { expiresIn: '1d' });

    return { token };
  }
}
