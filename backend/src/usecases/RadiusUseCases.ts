import { NotFoundError } from '../errors/index.js';
import { prisma } from '../lib/db.js';

interface RadiusUserOutputDto {
  id: number;
  username: string;
  planId: number | null;
  nasId: number | null;
  createdAt: string;
}

function mapRadiusUser(u: {
  id: number;
  username: string;
  planId: number | null;
  nasId: number | null;
  createdAt: Date;
}): RadiusUserOutputDto {
  return {
    id: u.id,
    username: u.username,
    planId: u.planId,
    nasId: u.nasId,
    createdAt: u.createdAt.toISOString(),
  };
}

// ── GetRadiusUsers ────────────────────────────────────────────────────────────

export class GetRadiusUsers {
  async execute(): Promise<RadiusUserOutputDto[]> {
    const users = await prisma.radiusUser.findMany({ orderBy: { id: 'desc' } });
    return users.map(mapRadiusUser);
  }
}

// ── CreateRadiusUser ──────────────────────────────────────────────────────────

interface CreateRadiusUserInputDto {
  username: string;
  password: string;
  planId?: number | null;
  nasId?: number | null;
}

export class CreateRadiusUser {
  async execute(dto: CreateRadiusUserInputDto): Promise<RadiusUserOutputDto> {
    await prisma.radcheck.create({
      data: {
        username: dto.username,
        attribute: 'Cleartext-Password',
        op: ':=',
        value: dto.password,
      },
    });

    const user = await prisma.radiusUser.create({
      data: {
        username: dto.username,
        planId: dto.planId ?? null,
        nasId: dto.nasId ?? null,
      },
    });

    return mapRadiusUser(user);
  }
}

// ── DeleteRadiusUser ──────────────────────────────────────────────────────────

interface DeleteRadiusUserInputDto {
  id: number;
}

export class DeleteRadiusUser {
  async execute({ id }: DeleteRadiusUserInputDto): Promise<void> {
    const user = await prisma.radiusUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('RADIUS user not found');

    await prisma.radcheck.deleteMany({ where: { username: user.username } });
    await prisma.radreply.deleteMany({ where: { username: user.username } });
    await prisma.radiusUser.delete({ where: { id } });
  }
}
