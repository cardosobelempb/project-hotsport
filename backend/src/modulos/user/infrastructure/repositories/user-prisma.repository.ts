import { SearchInput, SearchOutput } from "@/core";
import { Prisma } from "@/generated/prisma";
import { UserEntity } from "@/modulos/user/domain/entities/user.entity";
import { prisma } from "@/shared/lib/db";

import { UserPrismaMapper } from "../../application/mappers/user-prisma.mapper";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class UserPrismaRepository implements UserRepository {
  async search(params: SearchInput): Promise<SearchOutput<UserEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";
    const allowedSortBy = new Set<keyof Prisma.UserOrderByWithRelationInput>([
      "firstName",
      "lastName",
      "cpf",
      "phoneNumber",
      "status",
      "createdAt",
      "updatedAt",
    ]);
    const sortBy =
      params.sortBy &&
      allowedSortBy.has(
        params.sortBy as keyof Prisma.UserOrderByWithRelationInput,
      )
        ? params.sortBy
        : "createdAt";

    const where: Prisma.UserWhereInput = filter
      ? {
          OR: [
            { firstName: { contains: filter, mode: "insensitive" } },
            { lastName: { contains: filter, mode: "insensitive" } },
            { cpf: { contains: filter, mode: "insensitive" } },
            { phoneNumber: { contains: filter, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      items: users.map(UserPrismaMapper.toDomain),
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: page,
      perPage,
      sortBy,
      sortDirection,
      filter,
    };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return UserPrismaMapper.toDomain(user);
  }

  // async findByEmail(email: string): Promise<boolean | null> {
  //   const user = await prisma.user.findUnique({ where: { email } });
  //   if (!user) return null;
  //   return true;
  // }

  async findByCpf(cpf: string): Promise<boolean | null> {
    const user = await prisma.user.findUnique({ where: { cpf } });
    if (!user) return null;
    return true;
  }

  async save(entity: UserEntity): Promise<UserEntity> {
    const data = UserPrismaMapper.toPrisma(entity);
    const updateData: Prisma.UserUncheckedUpdateInput = {
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      phoneNumber: data.phoneNumber ?? "",
      cpf: data.cpf ?? "",
      createdAt: data.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    const user = await prisma.user.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: updateData,
    });

    return UserPrismaMapper.toDomain(user);
  }

  async delete(entity: UserEntity): Promise<void> {
    await prisma.user.delete({
      where: { id: entity.id.toString() },
    });
  }
}
