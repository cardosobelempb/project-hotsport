import { prisma } from '../lib/db.js';
import { NotFoundError } from '../errors/index.js';

interface RadiusUserOutputDto {
  id: number;
  username: string;
  plano_id: number | null;
  nas_id: number | null;
  criado_em: string;
}

function mapRadiusUser(u: {
  id: number;
  username: string;
  plano_id: number | null;
  nas_id: number | null;
  criado_em: Date;
}): RadiusUserOutputDto {
  return {
    id: u.id,
    username: u.username,
    plano_id: u.plano_id,
    nas_id: u.nas_id,
    criado_em: u.criado_em.toISOString(),
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
  plano_id?: number | null;
  nas_id?: number | null;
}

export class CreateRadiusUser {
  async execute(dto: CreateRadiusUserInputDto): Promise<RadiusUserOutputDto> {
    // Insert into radcheck for RADIUS authentication
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
        plano_id: dto.plano_id ?? null,
        nas_id: dto.nas_id ?? null,
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
    if (!user) throw new NotFoundError('Usuário RADIUS não encontrado');

    // Remove from radcheck too
    await prisma.radcheck.deleteMany({ where: { username: user.username } });
    await prisma.radreply.deleteMany({ where: { username: user.username } });
    await prisma.radiusUser.delete({ where: { id } });
  }
}
