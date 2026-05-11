import {
  Page,
  PageInput,
} from "@/common/domain/repositories/types/pagination.types";
import {
  PrismaDatabase,
  PrismaRepository,
} from "@/common/infrastructure/db/prisma-repository";
import { TOKENS } from "@/common/shared/container/tokens";
import { MemberShipEntity } from "@/modulos/identity/domain/entities/member-ship.entity";

import { MemberShipStatus } from "@/common/shared/enums/member-ship-status.enum";
import { MemberShipRepository } from "@/modulos/identity/domain/repositories/member-ship.repository";
import { Prisma } from "../../../../../../generated/prisma";
import { PrismaMemberShipMapper } from "../../mappers/member-ship-prisma.mapper";

export class PrismaMemberRepository
  extends PrismaRepository
  implements MemberShipRepository
{
  static inject = [TOKENS.PRISMA_CLIENT];

  constructor(prisma: PrismaDatabase) {
    super(prisma);
  }

  async page(params: PageInput): Promise<Page<MemberShipEntity>> {
    const pageNumber = params.page ?? 0;
    const size = params.size ?? 20;
    const skip = pageNumber * size;

    const [rawSortBy = "createdAt", rawSortDir = "desc"] = (
      params.sort ?? "createdAt,desc"
    ).split(",");

    const allowedSortFields: Array<
      keyof Prisma.MemberShipOrderByWithRelationInput
    > = ["userId", "createdAt", "updatedAt", "joinedAt"];

    const sortBy = allowedSortFields.includes(
      rawSortBy as keyof Prisma.MemberShipOrderByWithRelationInput,
    )
      ? rawSortBy
      : "createdAt";

    const sortDir = rawSortDir.toLowerCase() === "asc" ? "asc" : "desc";

    const where: Prisma.MemberShipWhereInput = {};

    if (params.filter) {
      where.OR = [
        { user: { email: { contains: params.filter, mode: "insensitive" } } },
      ];
    }

    const [total, memberships] = await this.prisma.$transaction([
      this.prisma.memberShip.count({ where }),
      this.prisma.memberShip.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: size,
      }),
    ]);

    return {
      content: memberships.map(PrismaMemberShipMapper.toDomain),
      pageable: {
        offset: skip,
        pageNumber,
        pageSize: size,
        sort: {
          sorted: true,
          unsorted: false,
          empty: false,
        },
        paged: true,
        unpaged: false,
      },
      sort: {
        sorted: true,
        unsorted: false,
        empty: false,
      },
      totalPages: Math.ceil(total / size),
      totalElements: total,
      last: skip + size >= total,
      size,
      number: pageNumber,
      numberOfElements: memberships.length,
      first: pageNumber === 0,
      empty: memberships.length === 0,
    };
  }

  async findById(id: string): Promise<MemberShipEntity | null> {
    const member = await this.prisma.memberShip.findUnique({
      where: { id },
    });

    if (!member) {
      return null;
    }

    return PrismaMemberShipMapper.toDomain(member);
  }
  async findManyByIds(ids: string[]): Promise<MemberShipEntity[]> {
    throw new Error("Method not implemented.");
  }
  async create(entity: MemberShipEntity): Promise<MemberShipEntity> {
    const raw = PrismaMemberShipMapper.toPrisma(entity);
    const created = await this.prisma.memberShip.create({
      data: raw,
    });

    return PrismaMemberShipMapper.toDomain(created);
  }
  async exists(id: string): Promise<boolean> {
    const member = await this.prisma.memberShip.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!member;
  }

  async save(entity: MemberShipEntity): Promise<MemberShipEntity> {
    const raw = PrismaMemberShipMapper.toPrisma(entity);
    const updated = await this.prisma.memberShip.update({
      where: { id: raw.id },
      data: raw,
    });

    return PrismaMemberShipMapper.toDomain(updated);
  }
  async delete(entity: MemberShipEntity): Promise<void> {
    await this.prisma.memberShip.delete({
      where: { id: entity.id.getValue() },
    });
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<MemberShipEntity[]> {
    const members = await this.prisma.memberShip.findMany({
      where: {},
    });

    return members.map(PrismaMemberShipMapper.toDomain);
  }
  async findByUserId(userId: string): Promise<MemberShipEntity[]> {
    const members = await this.prisma.memberShip.findMany({
      where: { userId },
    });

    return members.map(PrismaMemberShipMapper.toDomain);
  }

  async countActiveByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.memberShip.count({
      where: {
        organizationId: accountId,
        status: MemberShipStatus.ACTIVE,
      },
    });

    return count;
  }

  async countOwnersByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.memberShip.count({
      where: {
        organizationId: accountId,
        role: "OWNER",
      },
    });

    return count;
  }

  async findByUserIdAndAccountId(
    userId: string,
    accountId: string,
  ): Promise<MemberShipEntity | null> {
    const member = await this.prisma.memberShip.findFirst({
      where: {
        userId,
        organizationId: accountId,
      },
    });

    if (!member) {
      return null;
    }

    return PrismaMemberShipMapper.toDomain(member);
  }

  async findOwnerByAccountId(
    accountId: string,
  ): Promise<MemberShipEntity | null> {
    const member = await this.prisma.memberShip.findFirst({
      where: {
        organizationId: accountId,
        role: "OWNER",
      },
    });

    if (!member) {
      return null;
    }

    return PrismaMemberShipMapper.toDomain(member);
  }

  async existsByUserIdAndAccountId(
    userId: string,
    accountId: string,
  ): Promise<boolean> {
    const member = await this.prisma.memberShip.findFirst({
      where: {
        userId,
        organizationId: accountId,
      },
      select: { id: true },
    });

    return !!member;
  }

  async findManyByUserId(userId: string): Promise<MemberShipEntity[]> {
    const members = await this.prisma.memberShip.findMany({
      where: { userId },
    });

    return members.map(PrismaMemberShipMapper.toDomain);
  }
}
