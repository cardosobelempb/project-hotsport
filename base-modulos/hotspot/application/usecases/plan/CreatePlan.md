import { prisma } from "../../lib/db.js";
import { mapPlan, type PlanOutputDto } from "./plan-output.mapper.js";

interface CreatePlanInputDto {
  name: string;
  description?: string | null;
  amount: number;
  durationMinutes: number;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikId: number;
  active?: boolean;
  addressPool?: string;
  sharedUsers?: number;
}

export class CreatePlan {
  async execute(dto: CreatePlanInputDto): Promise<PlanOutputDto> {
    const plan = await prisma.plan.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        amount: dto.amount,
        durationMinutes: dto.durationMinutes,
        downloadSpeed: dto.downloadSpeed,
        uploadSpeed: dto.uploadSpeed,
        mikrotikId: dto.mikrotikId,
        active: dto.active ?? true,
        addressPool: dto.addressPool ?? "default-dhcp",
        sharedUsers: dto.sharedUsers ?? 10,
      },
    });

    return mapPlan(plan);
  }
}

export type { CreatePlanInputDto };
