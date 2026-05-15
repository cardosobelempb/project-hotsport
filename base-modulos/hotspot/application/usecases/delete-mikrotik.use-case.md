import { NotFoundError } from "@/core/domain/errors/usecases/not-founde.rror";
import { prisma } from "@/shared/lib/db";

export class DeleteMikrotik {
  async execute(id: string): Promise<void> {
    const exists = await prisma.mikrotik.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Mikrotik not found");

    await prisma.mikrotik.delete({ where: { id } });
  }
}
