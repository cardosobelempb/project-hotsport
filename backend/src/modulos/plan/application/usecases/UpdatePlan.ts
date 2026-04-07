import { NotFoundError } from "../../errors/index.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../lib/db.js";
import { mapPlan, type PlanOutputDto } from "./plan-output.mapper.js";

interface UpdatePlanInputDto {
  id: number;
  name?: string;
  description?: string | null | undefined;
  amount?: number;
  durationMinutes?: number;
  downloadSpeed?: string;
  uploadSpeed?: string;
  mikrotikId?: number;
  active?: boolean;
  addressPool?: string;
  sharedUsers?: number;
}

export class UpdatePlan {
  async execute({ id, ...data }: UpdatePlanInputDto): Promise<PlanOutputDto> {
    const exists = await prisma.plan.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Plan not found");

    const updateData: Prisma.PlanUncheckedUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.durationMinutes !== undefined)
      updateData.durationMinutes = data.durationMinutes;
    if (data.downloadSpeed !== undefined)
      updateData.downloadSpeed = data.downloadSpeed;
    if (data.uploadSpeed !== undefined)
      updateData.uploadSpeed = data.uploadSpeed;
    if (data.mikrotikId !== undefined) updateData.mikrotikId = data.mikrotikId;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.addressPool !== undefined)
      updateData.addressPool = data.addressPool;
    if (data.sharedUsers !== undefined)
      updateData.sharedUsers = data.sharedUsers;

    const plan = await prisma.plan.update({ where: { id }, data: updateData });
    return mapPlan(plan);
  }
}

export type { UpdatePlanInputDto };
