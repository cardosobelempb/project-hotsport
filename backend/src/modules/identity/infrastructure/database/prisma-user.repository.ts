import { SearchInput } from "@/common/domain/repositories/search.repository";
import { Page } from "@/common/domain/repositories/types/pagination.types";
import {
  PrismaDatabase,
  PrismaTransaction,
} from "@/common/infrastructure/db/prisma-repository";
import { TOKENS } from "@/common/shared/container/tokens";
import { Prisma } from "../../../../../generated/prisma";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRepository } from "../../domain/repositories/user.repository";
import { PrismaUserMapper } from "../mappers/user-prisma.mapper";

export class PrismaUserRepository extends UserRepository {
  static inject = [TOKENS.PRISMA_CLIENT];

  constructor(prisma: PrismaDatabase) {
    super(prisma);
  }
  updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  markEmailAsVerified(userId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  softDelete(userId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  withTx(tx: PrismaTransaction): this {
    throw new Error("Method not implemented.");
  }

  async page(params: SearchInput): Promise<Page<UserEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";
    const allowedSortBy = new Set<keyof Prisma.UserOrderByWithRelationInput>([
      "email",
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
          OR: [{ email: { contains: filter, mode: "insensitive" } }],
        }
      : {};

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      content: users.map(PrismaUserMapper.toDomain),
      pageable: {
        offset: (page - 1) * perPage,
        pageNumber: page,
        pageSize: perPage,
        sort: {
          sorted: !!params.sortBy,
          unsorted: !params.sortBy,
          empty: !params.sortBy,
        },

        paged: true,
        unpaged: false,
      },
      totalPages: Math.ceil(total / perPage),
      totalElements: total,
      last: page * perPage >= total,
      size: perPage,
      number: page,
      sort: {
        sorted: !!params.sortBy,
        unsorted: !params.sortBy,
        empty: !params.sortBy,
      },
      numberOfElements: users.length,
      first: page === 1,
      empty: users.length === 0,
    };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return PrismaUserMapper.toDomain(user);
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return false;
    return true;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return PrismaUserMapper.toDomain(user);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return false;
    return true;
  }

  async create(entity: UserEntity): Promise<UserEntity> {
    const data = PrismaUserMapper.toPrisma(entity);
    console.log("data", data);

    const user = await this.prisma.user.create({ data });

    return PrismaUserMapper.toDomain(user);
  }

  async createWithTx(
    entity: UserEntity,
    tx: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const data = PrismaUserMapper.toPrisma(entity);
    const user = await tx.user.create({ data });
    return PrismaUserMapper.toDomain(user);
  }

  async save(entity: UserEntity): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: entity.id.toString() },
      data: {
        ...PrismaUserMapper.toPrisma(entity),
      },
    });

    return PrismaUserMapper.toDomain(user);
  }

  async delete(entity: UserEntity): Promise<void> {
    await this.prisma.user.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findManyByIds(ids: string[]): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });

    return users.map(PrismaUserMapper.toDomain);
  }

  findActiveById(id: string): Promise<UserEntity | null> {
    throw new Error("Method not implemented.");
  }
  findActiveByEmail(email: string): Promise<UserEntity | null> {
    throw new Error("Method not implemented.");
  }
  findActiveByIdWithProfile(id: string): Promise<UserEntity | null> {
    throw new Error("Method not implemented.");
  }
  findWithRelations(id: string): Promise<UserEntity | null> {
    throw new Error("Method not implemented.");
  }
  existsActiveById(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  existsActiveByEmail(email: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  countActiveByTenant(tenantId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
  changePassword(id: string, passwordHash: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  restore(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
