import { NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

interface DeletePlanInputDto {
  id: number;
}

export class DeletePlan {
  async execute({ id }: DeletePlanInputDto): Promise<void> {
    const exists = await prisma.plan.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Plan not found");

    await prisma.plan.delete({ where: { id } });
  }
}

export type { DeletePlanInputDto };
