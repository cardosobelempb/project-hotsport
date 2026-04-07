import { SearchInput, SearchOutput } from "@/core";
import { Prisma } from "@/generated/prisma";
import { AuthEntity } from "@/modulos/auth/domain/entities/auth.entity";
import { prisma } from "@/shared/lib/db";

import { AuthPrismaMapper } from "../../application/mappers/auth-register-prisma.mapper";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class AuthPrismaRepository implements AuthRepository {
  async search(params: SearchInput): Promise<SearchOutput<AuthEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";
    const allowedSortBy = new Set<keyof Prisma.AuthOrderByWithRelationInput>([
      "createdAt",
    ]);
    const sortBy =
      params.sortBy &&
      allowedSortBy.has(
        params.sortBy as keyof Prisma.AuthOrderByWithRelationInput,
      )
        ? params.sortBy
        : "createdAt";

    const where: Prisma.AuthWhereInput = filter
      ? {
          OR: [{ email: { contains: filter, mode: "insensitive" } }],
        }
      : {};

    const [total, auths] = await prisma.$transaction([
      prisma.auth.count({ where }),
      prisma.auth.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      items: auths.map(AuthPrismaMapper.toDomain),
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: page,
      perPage,
      sortBy,
      sortDirection,
      filter,
    };
  }

  async findByUserId(userId: string): Promise<AuthEntity | null> {
    const auth = await prisma.auth.findUnique({
      where: { id: userId },
      include: { user: true },
    });
    if (!auth) return null;
    return AuthPrismaMapper.toDomain(auth);
  }

  async findById(id: string): Promise<AuthEntity | null> {
    const auth = await prisma.auth.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!auth) return null;
    return AuthPrismaMapper.toDomain(auth);
  }

  async findByEmail(email: string): Promise<AuthEntity | null> {
    const auth = await prisma.auth.findUnique({
      where: { email },
      include: { user: true },
    });

    if (!auth) return null;
    return AuthPrismaMapper.toDomain(auth);
  }

  async save(entity: AuthEntity): Promise<AuthEntity> {
    const data = AuthPrismaMapper.toPrisma(entity);
    const updateData: Prisma.AuthUncheckedUpdateInput = {
      userId: entity.userId.toString(),
      email: entity.email.toString(),
      passwordHash: entity.passwordHash?.toString() ?? "",
    };

    const auth = await prisma.auth.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: updateData,
    });

    return AuthPrismaMapper.toDomain(auth);
  }

  async delete(entity: AuthEntity): Promise<void> {
    await prisma.auth.delete({
      where: { id: entity.id.toString() },
    });
  }
}
