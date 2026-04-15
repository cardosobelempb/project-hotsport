import { MikrotikEntity } from "@/modulos/mikrotik/domain/entities/mikrotik-entity";
import { Prisma } from "../../../../../../../generated/prisma";

import {
  SearchInput,
  SearchOutput,
} from "@/core/domain/repositories/search.repository";
import { MikrotikRepository } from "@/modulos/mikrotik/domain/repositories/mikrotik.repository";
import { prisma } from "@/shared/lib/db";
import { MikrotikMapper } from "../../../mappers/mikrotik.mapper";

export class MikrotikPrismaRepository implements MikrotikRepository {
  async search(params: SearchInput): Promise<SearchOutput<MikrotikEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";
    const allowedSortBy = new Set<
      keyof Prisma.MikrotikOrderByWithRelationInput
    >([
      "name",
      "host",
      "port",
      "ipAddress",
      "macAddress",
      "username",
      "status",
      "createdAt",
      "updatedAt",
    ]);
    const sortBy =
      params.sortBy &&
      allowedSortBy.has(
        params.sortBy as keyof Prisma.MikrotikOrderByWithRelationInput,
      )
        ? params.sortBy
        : "createdAt";

    const where: Prisma.MikrotikWhereInput = filter
      ? {
          OR: [
            { name: { contains: filter, mode: "insensitive" } },
            { host: { contains: filter, mode: "insensitive" } },
            { ipAddress: { contains: filter, mode: "insensitive" } },
            { macAddress: { contains: filter, mode: "insensitive" } },
            { username: { contains: filter, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, mikrotiks] = await prisma.$transaction([
      prisma.mikrotik.count({ where }),
      prisma.mikrotik.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      items: mikrotiks.map(MikrotikMapper.toDomain),
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: page,
      perPage,
      sortBy,
      sortDirection,
      filter,
    };
  }

  async findById(id: string): Promise<MikrotikEntity | null> {
    const mikrotik = await prisma.mikrotik.findUnique({ where: { id } });
    if (!mikrotik) return null;
    return MikrotikMapper.toDomain(mikrotik);
  }

  async findByMacAddress(macAddress: string): Promise<MikrotikEntity | null> {
    const mikrotik = await prisma.mikrotik.findFirst({
      where: { macAddress: { equals: macAddress, mode: "insensitive" } },
    });
    if (!mikrotik) return null;
    return MikrotikMapper.toDomain(mikrotik);
  }

  async create(entity: MikrotikEntity): Promise<MikrotikEntity> {
    const data = MikrotikMapper.toPersistence(entity);

    const mikrotik = await prisma.mikrotik.create({ data });

    return MikrotikMapper.toDomain(mikrotik);
  }

  async createWithTx(
    entity: MikrotikEntity,
    tx: Prisma.TransactionClient,
  ): Promise<MikrotikEntity> {
    const data = MikrotikMapper.toPersistence(entity);
    const mikrotik = await tx.mikrotik.create({ data });
    return MikrotikMapper.toDomain(mikrotik);
  }

  async save(entity: MikrotikEntity): Promise<MikrotikEntity> {
    const mikrotik = await prisma.mikrotik.update({
      where: { id: entity.id.toString() },
      data: {
        name: entity.name,
        host: entity.host,
        port: entity.port,
        username: entity.username,
        passwordHash: entity.passwordHash,
        ipAddress: entity.ipAddress,
        macAddress: entity.macAddress,
        organizationId: entity.organizationId.toString(),
      },
    });

    return MikrotikMapper.toDomain(mikrotik);
  }

  async delete(entity: MikrotikEntity): Promise<void> {
    await prisma.mikrotik.delete({
      where: { id: entity.id.toString() },
    });
  }
}
