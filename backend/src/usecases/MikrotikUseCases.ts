import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface MikrotikOutputDto {
  id: string;
  name: string;
  ip: string;
  username: string;
  password: string;
  port: number;
  status: string;
  activeUsers: number;
  createdAt: string;
  updatedAt: string;
  hotspotUrl: string | null;
}

function mapMikrotik(m: {
  id: string;
  name: string;
  ipAddress: string;
  username: string;
  password: string;
  port: number;
  status: string;
  activeUsers: number;
  createdAt: Date;
  updatedAt: Date;
  hotspotUrl: string | null;
}): MikrotikOutputDto {
  return {
    id: m.id,
    name: m.name,
    ip: m.ipAddress,
    username: m.username,
    password: m.password,
    port: m.port,
    status: m.status,
    activeUsers: m.activeUsers,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    hotspotUrl: m.hotspotUrl,
  };
}

// ── GetMikrotiks ─────────────────────────────────────────────────────────────

export class GetMikrotiks {
  async execute(): Promise<MikrotikOutputDto[]> {
    const mikrotiks = await prisma.mikrotikRouter.findMany({
      orderBy: { id: "asc" },
    });
    return mikrotiks.map(mapMikrotik);
  }
}

// ── GetMikrotik ──────────────────────────────────────────────────────────────

export class GetMikrotik {
  async execute(id: string): Promise<MikrotikOutputDto> {
    const mikrotik = await prisma.mikrotikRouter.findUnique({ where: { id } });
    if (!mikrotik) throw new NotFoundError("Mikrotik não encontrado");
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
  hotspotUrl?: string | null;
}

export class CreateMikrotik {
  async execute(dto: CreateMikrotikInputDto): Promise<MikrotikOutputDto> {
    const mikrotik = await prisma.mikrotikRouter.create({
      data: {
        name: dto.name,
        ipAddress: dto.ip,
        username: dto.username,
        password: dto.password,
        port: dto.port ?? 8728,
        hotspotUrl: dto.hotspotUrl ?? null,
      },
    });
    return mapMikrotik(mikrotik);
  }
}

// ── UpdateMikrotik ───────────────────────────────────────────────────────────

interface UpdateMikrotikInputDto {
  id: string;
  name?: string;
  ip?: string;
  username?: string;
  password?: string;
  port?: number;
  hotspotUrl?: string | null;
}

export class UpdateMikrotik {
  async execute({
    id,
    ...data
  }: UpdateMikrotikInputDto): Promise<MikrotikOutputDto> {
    const exists = await prisma.mikrotikRouter.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Mikrotik não encontrado");

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.ip) updateData.ipAddress = data.ip;
    if (data.username) updateData.username = data.username;
    if (data.password) updateData.password = data.password;
    if (data.port) updateData.port = data.port;
    if (data.hotspotUrl !== undefined) updateData.hotspotUrl = data.hotspotUrl;

    const mikrotik = await prisma.mikrotikRouter.update({
      where: { id },
      data: updateData,
    });
    return mapMikrotik(mikrotik);
  }
}

// ── DeleteMikrotik ───────────────────────────────────────────────────────────

export class DeleteMikrotik {
  async execute(id: string): Promise<void> {
    const exists = await prisma.mikrotikRouter.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Mikrotik não encontrado");
    await prisma.mikrotikRouter.delete({ where: { id } });
  }
}
