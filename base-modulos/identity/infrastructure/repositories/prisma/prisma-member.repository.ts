import {
  Page,
  PageInput,
} from "@/common/domain/repositories/types/pagination.types";
import { PrismaDatabase } from "@/common/infrastructure/db/prisma-repository";
import { TOKENS } from "@/common/shared/container/tokens";

import { Prisma } from "../../../../../../generated/prisma";

import { MembershipRole } from "@/common/shared/enums/member-ship-role.enum";
import { MembershipStatus } from "@/common/shared/enums/member-ship-status.enum";
import { MembershipRepository } from "@/modulos/identity/domain/repositories/member-ship.repository";
import { MembershipEntity } from "@/modulos/tenant/domain/entities/member-ship.entity";
import { PrismaMembershipMapper } from "../../mappers/member-ship-prisma.mapper";

export class PrismaMembershipRepository extends MembershipRepository {
  static inject = [TOKENS.PRISMA_CLIENT];

  constructor(prisma: PrismaDatabase) {
    super(prisma);
  }

  async page(params: PageInput): Promise<Page<MembershipEntity>> {
    const pageNumber = params.page ?? 0;
    const size = params.size ?? 20;
    const skip = pageNumber * size;

    const [rawSortBy = "createdAt", rawSortDir = "desc"] = (
      params.sort ?? "createdAt,desc"
    ).split(",");

    const allowedSortFields: Array<
      keyof Prisma.MembershipOrderByWithRelationInput
    > = ["userId", "createdAt", "updatedAt", "joinedAt"];

    const sortBy = allowedSortFields.includes(
      rawSortBy as keyof Prisma.MembershipOrderByWithRelationInput,
    )
      ? rawSortBy
      : "createdAt";

    const sortDir = rawSortDir.toLowerCase() === "asc" ? "asc" : "desc";

    const where: Prisma.MembershipWhereInput = {};

    if (params.filter) {
      where.OR = [
        { user: { email: { contains: params.filter, mode: "insensitive" } } },
      ];
    }

    const [total, memberships] = await this.prisma.$transaction([
      this.prisma.membership.count({ where }),
      this.prisma.membership.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip,
        take: size,
      }),
    ]);

    return {
      content: memberships.map(PrismaMembershipMapper.toDomain),
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

  async findById(id: string): Promise<MembershipEntity | null> {
    const member = await this.prisma.membership.findUnique({
      where: { id },
    });

    if (!member) {
      return null;
    }

    return PrismaMembershipMapper.toDomain(member);
  }
  async findManyByIds(ids: string[]): Promise<MembershipEntity[]> {
    throw new Error("Method not implemented.");
  }
  async create(entity: MembershipEntity): Promise<MembershipEntity> {
    const raw = PrismaMembershipMapper.toPrisma(entity);
    const created = await this.prisma.membership.create({
      data: raw,
    });

    return PrismaMembershipMapper.toDomain(created);
  }
  async exists(id: string): Promise<boolean> {
    const member = await this.prisma.membership.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!member;
  }

  async save(entity: MembershipEntity): Promise<MembershipEntity> {
    const raw = PrismaMembershipMapper.toPrisma(entity);
    const updated = await this.prisma.membership.update({
      where: { id: raw.id },
      data: raw,
    });

    return PrismaMembershipMapper.toDomain(updated);
  }
  async delete(entity: MembershipEntity): Promise<void> {
    await this.prisma.membership.delete({
      where: { id: entity.id.getValue() },
    });
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<MembershipEntity[]> {
    const members = await this.prisma.membership.findMany({
      where: {},
    });

    return members.map(PrismaMembershipMapper.toDomain);
  }
  async findByUserId(userId: string): Promise<MembershipEntity[]> {
    const members = await this.prisma.membership.findMany({
      where: { userId },
    });

    return members.map(PrismaMembershipMapper.toDomain);
  }

  async countActiveByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.membership.count({
      where: {
        organizationId: accountId,
        status: MembershipStatus.ACTIVE,
      },
    });

    return count;
  }

  async countOwnersByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.membership.count({
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
  ): Promise<MembershipEntity | null> {
    const member = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId: accountId,
      },
    });

    if (!member) {
      return null;
    }

    return PrismaMembershipMapper.toDomain(member);
  }

  async findOwnerByAccountId(
    accountId: string,
  ): Promise<MembershipEntity | null> {
    const member = await this.prisma.membership.findFirst({
      where: {
        organizationId: accountId,
        role: "OWNER",
      },
    });

    if (!member) {
      return null;
    }

    return PrismaMembershipMapper.toDomain(member);
  }

  async existsByUserIdAndAccountId(
    userId: string,
    accountId: string,
  ): Promise<boolean> {
    const member = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId: accountId,
      },
      select: { id: true },
    });

    return !!member;
  }

  findByUserAndTenant(
    userId: string,
    tenantId: string,
  ): Promise<MembershipEntity | null> {
    throw new Error("Method not implemented.");
  }

  async findManyByUserId(userId: string): Promise<MembershipEntity[]> {
    const members = await this.prisma.membership.findMany({
      where: { userId },
    });

    return members.map(PrismaMembershipMapper.toDomain);
  }

  findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<MembershipEntity | null> {
    throw new Error("Method not implemented.");
  }
  listByOrganization(
    organizationId: string,
    filters?: any,
  ): Promise<MembershipEntity[]> {
    throw new Error("Method not implemented.");
  }
  changeRole(
    memberId: string,
    role: MembershipRole,
  ): Promise<MembershipEntity> {
    throw new Error("Method not implemented.");
  }
  removeMember(memberId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  acceptInvitation(memberId: string): Promise<MembershipEntity> {
    throw new Error("Method not implemented.");
  }
}
