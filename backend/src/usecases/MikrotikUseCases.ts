import { prisma } from '../lib/db.js';
import { NotFoundError } from '../errors/index.js';

interface MikrotikOutputDto {
  id: number;
  nome: string;
  ip: string;
  usuario: string;
  senha: string;
  porta: number;
  status: string;
  usuarios_ativos: number;
  criado_em: string;
  end_hotspot: string | null;
}

function mapMikrotik(m: {
  id: number;
  nome: string;
  ip: string;
  usuario: string;
  senha: string;
  porta: number;
  status: string;
  usuarios_ativos: number;
  criado_em: Date;
  end_hotspot: string | null;
}): MikrotikOutputDto {
  return {
    id: m.id,
    nome: m.nome,
    ip: m.ip,
    usuario: m.usuario,
    senha: m.senha,
    porta: m.porta,
    status: m.status,
    usuarios_ativos: m.usuarios_ativos,
    criado_em: m.criado_em.toISOString(),
    end_hotspot: m.end_hotspot,
  };
}

// ── GetMikrotiks ─────────────────────────────────────────────────────────────

export class GetMikrotiks {
  async execute(): Promise<MikrotikOutputDto[]> {
    const mikrotiks = await prisma.mikrotik.findMany({ orderBy: { id: 'asc' } });
    return mikrotiks.map(mapMikrotik);
  }
}

// ── GetMikrotik ──────────────────────────────────────────────────────────────

export class GetMikrotik {
  async execute(id: number): Promise<MikrotikOutputDto> {
    const mikrotik = await prisma.mikrotik.findUnique({ where: { id } });
    if (!mikrotik) throw new NotFoundError('Mikrotik não encontrado');
    return mapMikrotik(mikrotik);
  }
}

// ── CreateMikrotik ───────────────────────────────────────────────────────────

interface CreateMikrotikInputDto {
  nome: string;
  ip: string;
  usuario: string;
  senha: string;
  porta?: number;
  end_hotspot?: string | null;
}

export class CreateMikrotik {
  async execute(dto: CreateMikrotikInputDto): Promise<MikrotikOutputDto> {
    const mikrotik = await prisma.mikrotik.create({
      data: {
        nome: dto.nome,
        ip: dto.ip,
        usuario: dto.usuario,
        senha: dto.senha,
        porta: dto.porta ?? 8728,
        end_hotspot: dto.end_hotspot ?? null,
      },
    });
    return mapMikrotik(mikrotik);
  }
}

// ── UpdateMikrotik ───────────────────────────────────────────────────────────

interface UpdateMikrotikInputDto {
  id: number;
  nome?: string;
  ip?: string;
  usuario?: string;
  senha?: string;
  porta?: number;
  end_hotspot?: string | null | undefined;
}

export class UpdateMikrotik {
  async execute({ id, ...data }: UpdateMikrotikInputDto): Promise<MikrotikOutputDto> {
    const exists = await prisma.mikrotik.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Mikrotik não encontrado');

    const mikrotik = await prisma.mikrotik.update({ where: { id }, data });
    return mapMikrotik(mikrotik);
  }
}

// ── DeleteMikrotik ───────────────────────────────────────────────────────────

export class DeleteMikrotik {
  async execute(id: number): Promise<void> {
    const exists = await prisma.mikrotik.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Mikrotik não encontrado');
    await prisma.mikrotik.delete({ where: { id } });
  }
}
