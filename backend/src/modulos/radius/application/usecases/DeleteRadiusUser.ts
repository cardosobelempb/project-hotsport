import { NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

interface DeleteRadiusUserInputDto {
  id: number;
}

export class DeleteRadiusUser {
  async execute({ id }: DeleteRadiusUserInputDto): Promise<void> {
    const user = await prisma.radiusUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("RADIUS user not found");

    await prisma.radcheck.deleteMany({ where: { username: user.username } });
    await prisma.radreply.deleteMany({ where: { username: user.username } });
    await prisma.radiusUser.delete({ where: { id } });
  }
}

export type { DeleteRadiusUserInputDto };
