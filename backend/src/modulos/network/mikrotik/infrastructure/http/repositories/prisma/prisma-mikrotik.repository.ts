import {
  Page,
  PageInput,
} from "@/common/domain/repositories/types/pagination.types";
import {
  PrismaDatabase,
  PrismaRepository,
} from "@/common/infrastructure/db/prisma-repository";
import { TOKENS } from "@/common/shared/container/tokens";
import { MikrotikEntity } from "@/modulos/network/mikrotik/domain/entities/mikrotik-entity";
import { MikrotikRepository } from "@/modulos/network/mikrotik/domain/repositories/mikrotik.repository";
import { Prisma } from "../../../../../../../../generated/prisma";
import { PrismaMikrotikMapper } from "../../../mappers/mikrotik.mapper";

export class PrismaMikrotikRepository
  extends PrismaRepository
  implements MikrotikRepository
{
  static inject = [TOKENS.PRISMA_CLIENT];

  constructor(prisma: PrismaDatabase) {
    super(prisma);
  }
  findManyByIds(ids: string[]): Promise<MikrotikEntity[]> {
    throw new Error("Method not implemented.");
  }

  listByOrganization(organizationId: string): Promise<MikrotikEntity[]> {
    throw new Error("Method not implemented.");
  }
  findOnline(organizationId: string): Promise<MikrotikEntity[]> {
    throw new Error("Method not implemented.");
  }
  exists(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async page(params: PageInput): Promise<Page<MikrotikEntity>> {
    const page = params.page ?? 1;
    const size = params.size ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sort = params.sort ?? "desc";
    const allowedSortBy = new Set<
      keyof Prisma.MikrotikOrderByWithRelationInput
    >(["createdAt", "updatedAt"]);
    const sortBy =
      params.sort &&
      allowedSortBy.has(
        params.sort as keyof Prisma.MikrotikOrderByWithRelationInput,
      )
        ? params.sort
        : "createdAt";

    const where: Prisma.MikrotikWhereInput = filter
      ? {
          OR: [{ name: { contains: filter, mode: "insensitive" } }],
        }
      : {};

    const [total, mikrotiks] = await this.prisma.$transaction([
      this.prisma.mikrotik.count({ where }),
      this.prisma.mikrotik.findMany({
        where,
        orderBy: { [sortBy]: sort },
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    return {
      content: mikrotiks.map(PrismaMikrotikMapper.toDomain),
      pageable: {
        offset: (page - 1) * size,
        pageNumber: page,
        pageSize: size,
        sort: {
          sorted: !!params.sort,
          unsorted: !params.sort,
          empty: !params.sort,
        },

        paged: true,
        unpaged: false,
      },
      totalPages: Math.ceil(total / size),
      totalElements: total,
      last: page * size >= total,
      size,
      number: page,
      sort: {
        sorted: !!params.sort,
        unsorted: !params.sort,
        empty: !params.sort,
      },
      numberOfElements: mikrotiks.length,
      first: page === 1,
      empty: mikrotiks.length === 0,
    };
  }

  async findById(id: string): Promise<MikrotikEntity | null> {
    const mikrotik = await this.prisma.mikrotik.findUnique({ where: { id } });
    if (!mikrotik) return null;
    return PrismaMikrotikMapper.toDomain(mikrotik);
  }

  async findByMacAddress(macAddress: string): Promise<MikrotikEntity | null> {
    const mikrotik = await this.prisma.mikrotik.findFirst({
      where: { macAddress: { equals: macAddress, mode: "insensitive" } },
    });
    if (!mikrotik) return null;
    return PrismaMikrotikMapper.toDomain(mikrotik);
  }

  async create(entity: MikrotikEntity): Promise<MikrotikEntity> {
    const data = PrismaMikrotikMapper.toPersistence(entity);

    const mikrotik = await this.prisma.mikrotik.create({ data });

    return PrismaMikrotikMapper.toDomain(mikrotik);
  }

  async createWithTx(
    entity: MikrotikEntity,
    tx: Prisma.TransactionClient,
  ): Promise<MikrotikEntity> {
    const data = PrismaMikrotikMapper.toPersistence(entity);
    const mikrotik = await tx.mikrotik.create({ data });
    return PrismaMikrotikMapper.toDomain(mikrotik);
  }

  async save(entity: MikrotikEntity): Promise<MikrotikEntity> {
    const mikrotik = await this.prisma.mikrotik.update({
      where: { id: entity.id.toString() },
      data: {
        name: entity.name,
        host: entity.host,
        port: entity.port,
        username: entity.username,
        passwordHash: entity.passwordHash.getValue(),
        ipAddress: entity.ipAddress,
        macAddress: entity.macAddress,
        organizationId: entity.organizationId.toString(),
      },
    });

    return PrismaMikrotikMapper.toDomain(mikrotik);
  }

  async delete(entity: MikrotikEntity): Promise<void> {
    await this.prisma.mikrotik.delete({
      where: { id: entity.id.toString() },
    });
  }
}
