import { NotFoundError } from '../errors/index.js';
import type { Prisma } from '../generated/prisma/index.js';
import { prisma } from '../lib/db.js';

interface PlanOutputDto {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  durationMinutes: number;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikId: number;
  active: boolean;
  addressPool: string;
  sharedUsers: number;
}

function mapPlan(p: {
  id: number;
  name: string;
  description: string | null;
  amount: unknown;
  durationMinutes: number;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikId: number;
  active: boolean;
  addressPool: string;
  sharedUsers: number;
}): PlanOutputDto {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    amount: Number(p.amount),
    durationMinutes: p.durationMinutes,
    downloadSpeed: p.downloadSpeed,
    uploadSpeed: p.uploadSpeed,
    mikrotikId: p.mikrotikId,
    active: p.active,
    addressPool: p.addressPool,
    sharedUsers: p.sharedUsers,
  };
}

// ── GetPlans ────────────────────────────────────────────────────────────────

export class GetPlans {
  async execute(): Promise<PlanOutputDto[]> {
    const plans = await prisma.plan.findMany({ orderBy: { id: 'asc' } });
    return plans.map(mapPlan);
  }
}

// ── CreatePlan ───────────────────────────────────────────────────────────────

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
        addressPool: dto.addressPool ?? 'default-dhcp',
        sharedUsers: dto.sharedUsers ?? 10,
      },
    });
    return mapPlan(plan);
  }
}

// ── UpdatePlan ───────────────────────────────────────────────────────────────

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
    if (!exists) throw new NotFoundError('Plan not found');

    const updateData: Prisma.PlanUncheckedUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.downloadSpeed !== undefined) updateData.downloadSpeed = data.downloadSpeed;
    if (data.uploadSpeed !== undefined) updateData.uploadSpeed = data.uploadSpeed;
    if (data.mikrotikId !== undefined) updateData.mikrotikId = data.mikrotikId;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.addressPool !== undefined) updateData.addressPool = data.addressPool;
    if (data.sharedUsers !== undefined) updateData.sharedUsers = data.sharedUsers;

    const plan = await prisma.plan.update({ where: { id }, data: updateData });
    return mapPlan(plan);
  }
}

// ── DeletePlan ───────────────────────────────────────────────────────────────

interface DeletePlanInputDto {
  id: number;
}

export class DeletePlan {
  async execute({ id }: DeletePlanInputDto): Promise<void> {
    const exists = await prisma.plan.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Plan not found');

    await prisma.plan.delete({ where: { id } });
  }
}
