import { prisma } from '../lib/db.js';
import { NotFoundError } from '../errors/index.js';

interface PlanoOutputDto {
  id: number;
  nome: string;
  descricao: string | null;
  valor: number;
  duracao_minutos: number;
  velocidade_down: string;
  velocidade_up: string;
  mikrotik_id: number;
  ativo: boolean;
  address_pool: string;
  shared_users: number;
}

function mapPlano(p: {
  id: number;
  nome: string;
  descricao: string | null;
  valor: unknown;
  duracao_minutos: number;
  velocidade_down: string;
  velocidade_up: string;
  mikrotik_id: number;
  ativo: boolean;
  address_pool: string;
  shared_users: number;
}): PlanoOutputDto {
  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    valor: Number(p.valor),
    duracao_minutos: p.duracao_minutos,
    velocidade_down: p.velocidade_down,
    velocidade_up: p.velocidade_up,
    mikrotik_id: p.mikrotik_id,
    ativo: p.ativo,
    address_pool: p.address_pool,
    shared_users: p.shared_users,
  };
}

// ── GetPlans ────────────────────────────────────────────────────────────────

export class GetPlans {
  async execute(): Promise<PlanoOutputDto[]> {
    const planos = await prisma.plano.findMany({ orderBy: { id: 'asc' } });
    return planos.map(mapPlano);
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
  async execute(dto: CreatePlanInputDto): Promise<PlanoOutputDto> {
    const plano = await prisma.plano.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao ?? null,
        valor: dto.valor,
        duracao_minutos: dto.duracao_minutos,
        velocidade_down: dto.velocidade_down,
        velocidade_up: dto.velocidade_up,
        mikrotik_id: dto.mikrotik_id,
        ativo: dto.ativo ?? true,
        address_pool: dto.address_pool ?? 'default-dhcp',
        shared_users: dto.shared_users ?? 10,
      },
    });
    return mapPlano(plano);
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
  async execute({ id, ...data }: UpdatePlanInputDto): Promise<PlanoOutputDto> {
    const exists = await prisma.plano.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Plano não encontrado');

    // Filter out undefined values to avoid exactOptionalPropertyTypes issues
    const updateData: Partial<typeof data> = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if ('descricao' in data) updateData.descricao = data.descricao;
    if (data.valor !== undefined) updateData.valor = data.valor;
    if (data.duracao_minutos !== undefined) updateData.duracao_minutos = data.duracao_minutos;
    if (data.velocidade_down !== undefined) updateData.velocidade_down = data.velocidade_down;
    if (data.velocidade_up !== undefined) updateData.velocidade_up = data.velocidade_up;
    if (data.mikrotik_id !== undefined) updateData.mikrotik_id = data.mikrotik_id;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;
    if (data.address_pool !== undefined) updateData.address_pool = data.address_pool;
    if (data.shared_users !== undefined) updateData.shared_users = data.shared_users;

    const plano = await prisma.plano.update({ where: { id }, data: updateData });
    return mapPlano(plano);
  }
}

// ── DeletePlan ───────────────────────────────────────────────────────────────

interface DeletePlanInputDto {
  id: number;
}

export class DeletePlan {
  async execute({ id }: DeletePlanInputDto): Promise<void> {
    const exists = await prisma.plano.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Plano não encontrado');

    await prisma.plano.delete({ where: { id } });
  }
}
