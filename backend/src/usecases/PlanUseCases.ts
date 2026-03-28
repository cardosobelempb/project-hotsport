import { NotFoundError } from "../errors/index.js";
import type { Prisma } from "../generated/prisma/index.js";
import { prisma } from "../lib/db.js";

interface PlanOutputDto {
  id: number;
  name: string;
  description: string | null;
  price: unknown;
  durationMins: number;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikId: number;
  isActive: boolean;
  addressPool: string;
  sharedUsers: number;
}

function mapPlan(p: {
  id: number;
  name: string;
  description: string | null;
  price: unknown;
  durationMins: number;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikId: number;
  isActive: boolean;
  addressPool: string;
  sharedUsers: number;
}): PlanOutputDto {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    durationMins: p.durationMins,
    downloadSpeed: p.downloadSpeed,
    uploadSpeed: p.uploadSpeed,
    mikrotikId: p.mikrotikId,
    isActive: p.isActive,
    addressPool: p.addressPool,
    sharedUsers: p.sharedUsers,
  };
}

// ── GetPlans ────────────────────────────────────────────────────────────────

export class GetPlans {
  async execute(): Promise<PlanOutputDto[]> {
    const plans = await prisma.plan.findMany({ orderBy: { id: "asc" } });
    return plans.map(mapPlan);
  }
}

// ── CreatePlan ───────────────────────────────────────────────────────────────

interface CreatePlanInputDto {
  nome: string;
  descricao?: string | null;
  valor: number;
  duracao_minutos: number;
  velocidade_down: string;
  velocidade_up: string;
  mikrotik_id: number;
  ativo?: boolean;
  address_pool?: string;
  shared_users?: number;
}

export class CreatePlan {
  async execute(dto: CreatePlanInputDto): Promise<PlanOutputDto> {
    const plan = await prisma.plan.create({
      data: {
        name: dto.nome,
        description: dto.descricao ?? null,
        price: dto.valor,
        durationMins: dto.duracao_minutos,
        downloadSpeed: dto.velocidade_down,
        uploadSpeed: dto.velocidade_up,
        mikrotikId: dto.mikrotik_id,
        isActive: dto.ativo ?? true,
        addressPool: dto.address_pool ?? "default-dhcp",
        sharedUsers: dto.shared_users ?? 10,
      },
    });
    return mapPlan(plan);
  }
}

// ── UpdatePlan ───────────────────────────────────────────────────────────────

interface UpdatePlanInputDto {
  id: number;
  nome?: string;
  descricao?: string | null | undefined;
  valor?: number;
  duracao_minutos?: number;
  velocidade_down?: string;
  velocidade_up?: string;
  mikrotik_id?: number;
  ativo?: boolean;
  address_pool?: string;
  shared_users?: number;
}

export class UpdatePlan {
  async execute({ id, ...data }: UpdatePlanInputDto): Promise<PlanOutputDto> {
    const exists = await prisma.plan.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Plan não encontrado");

    // Filter out undefined values to avoid exactOptionalPropertyTypes issues
    const updateData: Prisma.PlanUncheckedUpdateInput = {};
    if (data.nome !== undefined) updateData.name = data.nome;
    if (data.descricao !== undefined) updateData.description = data.descricao;
    if (data.valor !== undefined) updateData.price = data.valor;
    if (data.duracao_minutos !== undefined)
      updateData.durationMins = data.duracao_minutos;
    if (data.velocidade_down !== undefined)
      updateData.downloadSpeed = data.velocidade_down;
    if (data.velocidade_up !== undefined)
      updateData.uploadSpeed = data.velocidade_up;
    if (data.mikrotik_id !== undefined)
      updateData.mikrotikId = data.mikrotik_id;
    if (data.ativo !== undefined) updateData.isActive = data.ativo;
    if (data.address_pool !== undefined)
      updateData.addressPool = data.address_pool;
    if (data.shared_users !== undefined)
      updateData.sharedUsers = data.shared_users;

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
    if (!exists) throw new NotFoundError("Plan não encontrado");

    await prisma.plan.delete({ where: { id } });
  }
}
