import bcrypt from 'bcrypt';

import { UnauthorizedError } from '../../../errors/index.js';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.js';

export interface AdminLoginInputDto {
  email: string;
  senha: string;
}

export interface AdminLoginOutputDto {
  adminId: string;
  email: string;
}

export class AdminLoginUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute({ email, senha }: AdminLoginInputDto): Promise<AdminLoginOutputDto> {
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isSenhaValida = await bcrypt.compare(senha, admin.passwordHash);

    if (!isSenhaValida) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    return { adminId: String(admin.id), email: admin.email };
  }
}
