import {
  Page,
  PageInput,
} from "@/common/domain/repositories/types/pagination.types";
import { MemberEntity } from "@/modulos/organization/domain/entities/member.entity";
import { MemberRepository } from "@/modulos/organization/domain/repositories/member.repository";

import { PrismaRepository } from "@/common/infrastructure/db/prisma-transaction";
import { PrismaDatabase } from "@/common/infrastructure/db/prisma.client";
import { TOKENS } from "@/common/shared/container/tokens";
import { MemberStatus } from "@/common/shared/enums/member-status.enum";
import { Prisma } from "../../../../../../../generated/prisma";
import { PrismaMemberMapper } from "../../mappers/member-prisma.mapper";

export class PrismaMemberRepository
  extends PrismaRepository
  implements MemberRepository
{
  static inject = [TOKENS.PRISMA_CLIENT];

  constructor(prisma: PrismaDatabase) {
    super(prisma);
  }

  async page(params: PageInput): Promise<Page<MemberEntity>> {
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
      content: memberships.map(PrismaMemberMapper.toDomain),
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

  async findById(id: string): Promise<MemberEntity | null> {
    const member = await this.prisma.membership.findUnique({
      where: { id },
    });

    if (!member) {
      return null;
    }

    return PrismaMemberMapper.toDomain(member);
  }
  async findManyByIds(ids: string[]): Promise<MemberEntity[]> {
    throw new Error("Method not implemented.");
  }
  async create(entity: MemberEntity): Promise<MemberEntity> {
    const raw = PrismaMemberMapper.toPrisma(entity);
    const created = await this.prisma.membership.create({
      data: raw,
    });

    return PrismaMemberMapper.toDomain(created);
  }
  async exists(id: string): Promise<boolean> {
    const member = await this.prisma.membership.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!member;
  }

  async save(entity: MemberEntity): Promise<MemberEntity> {
    const raw = PrismaMemberMapper.toPrisma(entity);
    const updated = await this.prisma.membership.update({
      where: { id: raw.id },
      data: raw,
    });

    return PrismaMemberMapper.toDomain(updated);
  }
  async delete(entity: MemberEntity): Promise<void> {
    await this.prisma.membership.delete({
      where: { id: entity.id.getValue() },
    });
  }

  async findByOrganizationId(organizationId: string): Promise<MemberEntity[]> {
    const members = await this.prisma.membership.findMany({
      where: {},
    });

    return members.map(PrismaMemberMapper.toDomain);
  }
  async findByUserId(userId: string): Promise<MemberEntity[]> {
    const members = await this.prisma.membership.findMany({
      where: { userId },
    });

    return members.map(PrismaMemberMapper.toDomain);
  }

  async countActiveByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.membership.count({
      where: {
        organizationId: accountId,
        status: MemberStatus.ACTIVE,
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
  ): Promise<MemberEntity | null> {
    const member = await this.prisma.membership.findFirst({
      where: {
        userId,
        organizationId: accountId,
      },
    });

    if (!member) {
      return null;
    }

    return PrismaMemberMapper.toDomain(member);
  }

  async findOwnerByAccountId(accountId: string): Promise<MemberEntity | null> {
    const member = await this.prisma.membership.findFirst({
      where: {
        organizationId: accountId,
        role: "OWNER",
      },
    });

    if (!member) {
      return null;
    }

    return PrismaMemberMapper.toDomain(member);
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

  async findManyByUserId(userId: string): Promise<MemberEntity[]> {
    const members = await this.prisma.membership.findMany({
      where: { userId },
    });

    return members.map(PrismaMemberMapper.toDomain);
  }
}
