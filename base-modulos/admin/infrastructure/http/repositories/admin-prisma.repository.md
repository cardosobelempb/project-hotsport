import { AdminDomainEntity, IAdminRepository } from "@/admin/domain";
import { prisma } from "@/lib/db";

export class AdminPrismaRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<AdminDomainEntity | null> {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) return null;

    return {
      id: admin.id,
      email: admin.email,
      passwordHash: admin.password,
    };
  }
}
