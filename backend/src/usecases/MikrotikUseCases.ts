import { NotFoundError } from '../errors/index.js';
import { prisma } from '../lib/db.js';

interface MikrotikOutputDto {
  id: number;
  name: string;
  ip: string;
  username: string;
  password: string;
  port: number;
  status: string;
  activeUsers: number;
  createdAt: string;
  hotspotAddress: string | null;
}

function mapMikrotik(m: {
  id: number;
  name: string;
  ip: string;
  username: string;
  password: string;
  port: number;
  status: string;
  activeUsers: number;
  createdAt: Date;
  hotspotAddress: string | null;
}): MikrotikOutputDto {
  return {
    id: m.id,
    name: m.name,
    ip: m.ip,
    username: m.username,
    password: m.password,
    port: m.port,
    status: m.status,
    activeUsers: m.activeUsers,
    createdAt: m.createdAt.toISOString(),
    hotspotAddress: m.hotspotAddress,
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
    if (!mikrotik) throw new NotFoundError('Mikrotik not found');
    return mapMikrotik(mikrotik);
  }
}

// ── CreateMikrotik ───────────────────────────────────────────────────────────

interface CreateMikrotikInputDto {
  name: string;
  ip: string;
  username: string;
  password: string;
  port?: number;
  hotspotAddress?: string | null;
}

export class CreateMikrotik {
  async execute(dto: CreateMikrotikInputDto): Promise<MikrotikOutputDto> {
    const mikrotik = await prisma.mikrotik.create({
      data: {
        name: dto.name,
        ip: dto.ip,
        username: dto.username,
        password: dto.password,
        port: dto.port ?? 8728,
        hotspotAddress: dto.hotspotAddress ?? null,
      },
    });
    return mapMikrotik(mikrotik);
  }
}

// ── UpdateMikrotik ───────────────────────────────────────────────────────────

interface UpdateMikrotikInputDto {
  id: number;
  name?: string;
  ip?: string;
  username?: string;
  password?: string;
  port?: number;
  hotspotAddress?: string | null;
}

export class UpdateMikrotik {
  async execute({ id, ...data }: UpdateMikrotikInputDto): Promise<MikrotikOutputDto> {
    const exists = await prisma.mikrotik.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Mikrotik not found');

    const mikrotik = await prisma.mikrotik.update({ where: { id }, data });
    return mapMikrotik(mikrotik);
  }
}

// ── DeleteMikrotik ───────────────────────────────────────────────────────────

export class DeleteMikrotik {
  async execute(id: number): Promise<void> {
    const exists = await prisma.mikrotik.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Mikrotik not found');
    await prisma.mikrotik.delete({ where: { id } });
  }
}
