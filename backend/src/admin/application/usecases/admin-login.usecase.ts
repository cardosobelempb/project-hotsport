import bcrypt from 'bcrypt';

import { UnauthorizedError } from '../../../errors/index.js';
import type { IAdminRepository } from '../../domain/repositories/admin.repository.js';

export interface AdminLoginInputDto {
  email: string;
  password: string;
}

export interface AdminLoginOutputDto {
  adminId: string;
  email: string;
}

export class AdminLoginUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute({ email, password }: AdminLoginInputDto): Promise<AdminLoginOutputDto> {
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    return { adminId: String(admin.id), email: admin.email };
  }
}
