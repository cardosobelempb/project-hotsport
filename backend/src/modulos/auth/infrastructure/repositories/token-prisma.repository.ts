import { SearchInput, SearchOutput } from "@/core";
import { Prisma } from "@/generated/prisma";
import { TokenEntity } from "@/modulos/auth/domain/entities/token.entity";
import { prisma } from "@/shared/lib/db";

import { TokenPrismaMapper } from "../../application/mappers/token-register-prisma.mapper";
import { TokenRepository } from "../../domain/repositories/TokenRepository";

export class TokenPrismaRepository implements TokenRepository {
  async search(params: SearchInput): Promise<SearchOutput<TokenEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";
    const allowedSortBy = new Set<keyof Prisma.TokenOrderByWithRelationInput>([
      "createdAt",
      "expiresAt",
    ]);
    const sortBy =
      params.sortBy &&
      allowedSortBy.has(
        params.sortBy as keyof Prisma.TokenOrderByWithRelationInput,
      )
        ? params.sortBy
        : "createdAt";

    const where: Prisma.TokenWhereInput = filter
      ? {
          OR: [{ refreshToken: { contains: filter, mode: "insensitive" } }],
        }
      : {};

    const [total, tokens] = await prisma.$transaction([
      prisma.token.count({ where }),
      prisma.token.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      items: tokens.map(TokenPrismaMapper.toDomain),
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: page,
      perPage,
      sortBy,
      sortDirection,
      filter,
    };
  }

  async findById(id: string): Promise<TokenEntity | null> {
    const token = await prisma.token.findUnique({ where: { id } });
    if (!token) return null;
    return TokenPrismaMapper.toDomain(token);
  }

  // async findByEmail(email: string): Promise<boolean | null> {
  //   const token = await prisma.token.findUnique({ where: { email } });
  //   if (!token) return null;
  //   return true;
  // }

  // async findByCpf(cpf: string): Promise<boolean | null> {
  //   const token = await prisma.token.findUnique({ where: { cpf } });
  //   if (!token) return null;
  //   return true;
  // }

  async save(entity: TokenEntity): Promise<TokenEntity> {
    const data = TokenPrismaMapper.toPrisma(entity);
    const updateData: Prisma.TokenUncheckedUpdateInput = {
      userId: entity.userId.toString(),
      refreshToken: entity.refreshToken.toString(),
      expiresAt: entity.expiresAt || new Date(),
    };

    const token = await prisma.token.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: updateData,
    });

    return TokenPrismaMapper.toDomain(token);
  }

  async delete(entity: TokenEntity): Promise<void> {
    await prisma.token.delete({
      where: { id: entity.id.toString() },
    });
  }
}
