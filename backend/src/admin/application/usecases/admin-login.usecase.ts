import bcrypt from 'bcrypt';

import { UnauthorizedError } from '../../../errors/index.js';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.js';

export interface AdminLoginInputDto {
  email: string;
  senha: string;
}

export interface AdminLoginOutputDto {
  id: number;
  email: string;
}

export class AdminLoginUseCase {
  constructor(private readonly repository: IAdminRepository) {}

  async execute({ email, senha }: AdminLoginInputDto): Promise<AdminLoginOutputDto> {
    const admin = await this.repository.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isSenhaValida = await bcrypt.compare(senha, admin.password);

    if (!isSenhaValida) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    return { id: admin.id, email: admin.email };
  }
}
