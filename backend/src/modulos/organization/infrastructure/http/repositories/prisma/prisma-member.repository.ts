import {
  Page,
  PageInput,
  Sort,
} from "@/common/domain/repositories/types/pagination.types";
import { getPrismaClient } from "@/common/infrastructure/db/prisma.client";
import { MemberEntity } from "@/modulos/organization/domain/entities/member.entity";
import { MemberRepository } from "@/modulos/organization/domain/repositories/member.repository";

import { MemberStatus } from "@/common/shared/enums/member-status.enum";
import { Prisma } from "../../../../../../../generated/prisma";
import { PrismaMemberMapper } from "../../mappers/member-prisma.mapper";

export class PrismaMemberRepository implements MemberRepository {
  private prisma = getPrismaClient();

  async page(params: PageInput): Promise<Page<MemberEntity>> {
    // ─── Paginação (zero-based, padrão Spring Boot) ───────────────────────
    const pageNumber = params.page ?? 0; // Spring começa em 0, não em 1
    const size = params.size ?? 20; // Padrão Spring Data: 20
    const skip = pageNumber * size; // offset = page * size

    // ─── Ordenação (parse do formato 'campo,direção') ──────────────────────
    const [rawSortBy = "createdAt", rawSortDir = "desc"] = (
      params.sort ?? "createdAt,desc"
    ).split(",");

    const allowedSortFields: Array<
      keyof Prisma.MemberOrderByWithRelationInput
    > = ["status", "createdAt", "updatedAt"];

    // Garante que somente campos permitidos sejam usados (evita SQL injection por campo)
    const sortBy = allowedSortFields.includes(
      rawSortBy as keyof Prisma.MemberOrderByWithRelationInput,
    )
      ? (rawSortBy as keyof Prisma.MemberOrderByWithRelationInput)
      : "createdAt";

    // Garante que a direção seja apenas 'asc' ou 'desc'
    const sortDirection: Prisma.SortOrder =
      rawSortDir === "asc" ? "asc" : "desc";

    const isSorted = !!params.sort;

    // ─── Filtro ────────────────────────────────────────────────────────────
    const filter = params.filter?.trim() ?? "";
    const where = this.buildWhere(filter);

    // ─── Query paginada em transação atômica ──────────────────────────────
    const [totalElements, organizations] = await this.prisma.$transaction([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip,
        take: size,
      }),
    ]);

    // ─── Cálculos derivados ───────────────────────────────────────────────
    const totalPages = Math.ceil(totalElements / size);
    const numberOfElements = organizations.length;
    const isFirst = pageNumber === 0;
    const isLast = pageNumber >= totalPages - 1;
    const isEmpty = numberOfElements === 0;

    // ─── Metadados de sort (espelha Sort do Spring) ───────────────────────
    const sortMeta: Sort = {
      sorted: isSorted,
      unsorted: !isSorted,
      empty: !isSorted,
    };

    // ─── Retorno no contrato Spring Data Page<T> ──────────────────────────
    return {
      content: organizations.map(PrismaMemberMapper.toDomain),

      pageable: {
        sort: sortMeta,
        offset: skip, // posição absoluta do primeiro elemento
        pageSize: size,
        pageNumber,
        paged: true,
        unpaged: false,
      },

      sort: sortMeta,
      totalElements,
      totalPages,
      numberOfElements,
      size,
      number: pageNumber, // 'number' é o nome do campo no Spring (página atual)
      first: isFirst,
      last: isLast,
      empty: isEmpty,
    };
  }
  private buildWhere(filter: string): Prisma.MemberWhereInput {
    if (!filter) return {};

    return {
      OR: [{ email: { contains: filter, mode: "insensitive" } }],
    };
  }
  async findById(id: string): Promise<MemberEntity | null> {
    const member = await this.prisma.member.findUnique({
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
    const created = await this.prisma.member.create({
      data: raw,
    });

    return PrismaMemberMapper.toDomain(created);
  }
  async exists(id: string): Promise<boolean> {
    const member = await this.prisma.member.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!member;
  }

  async save(entity: MemberEntity): Promise<MemberEntity> {
    const raw = PrismaMemberMapper.toPrisma(entity);
    const updated = await this.prisma.member.update({
      where: { id: raw.id },
      data: raw,
    });

    return PrismaMemberMapper.toDomain(updated);
  }
  async delete(entity: MemberEntity): Promise<void> {
    await this.prisma.member.delete({
      where: { id: entity.id.getValue() },
    });
  }

  async findByEmail(email: string): Promise<MemberEntity | null> {
    const member = await this.prisma.member.findUnique({
      where: { email },
    });

    if (!member) {
      return null;
    }

    return PrismaMemberMapper.toDomain(member);
  }

  async findByOrganizationId(organizationId: string): Promise<MemberEntity[]> {
    const members = await this.prisma.member.findMany({
      where: {},
    });

    return members.map(PrismaMemberMapper.toDomain);
  }
  async findByUserId(userId: string): Promise<MemberEntity[]> {
    const members = await this.prisma.member.findMany({
      where: { userId },
    });

    return members.map(PrismaMemberMapper.toDomain);
  }

  async countActiveByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.member.count({
      where: {
        organizationId: accountId,
        status: MemberStatus.ACTIVE,
      },
    });

    return count;
  }

  async countOwnersByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.member.count({
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
    const member = await this.prisma.member.findFirst({
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
    const member = await this.prisma.member.findFirst({
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
    const member = await this.prisma.member.findFirst({
      where: {
        userId,
        organizationId: accountId,
      },
      select: { id: true },
    });

    return !!member;
  }

  async findManyByUserId(userId: string): Promise<MemberEntity[]> {
    const members = await this.prisma.member.findMany({
      where: { userId },
    });

    return members.map(PrismaMemberMapper.toDomain);
  }
}
