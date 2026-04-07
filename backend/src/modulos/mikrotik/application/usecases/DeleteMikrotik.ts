import { NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

export class DeleteMikrotik {
  async execute(id: number): Promise<void> {
    const exists = await prisma.mikrotik.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Mikrotik not found");

    await prisma.mikrotik.delete({ where: { id } });
  }
}
