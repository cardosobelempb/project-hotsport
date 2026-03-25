import { prisma } from '../../../lib/db.js';
import type { AdminEntity, IAdminRepository } from '../../domain/repositories/admin.repository.js';

export class AdminPrismaRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<AdminEntity | null> {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) return null;

    return {
      id: admin.id,
      email: admin.email,
      password: admin.password,
      createdAt: admin.createdAt,
    };
  }
}
