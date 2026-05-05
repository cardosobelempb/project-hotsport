import { SearchInput } from "@/common/domain/repositories/search.repository";
import { Page } from "@/common/domain/repositories/types/pagination.types";
import { UserEntity } from "@/modulos/identity/domain/entities/user.entity";
import { UserRepository } from "@/modulos/identity/domain/repositories/user.repository";
import { Prisma, PrismaClient } from "../../../../../../../generated/prisma";
import { UserPrismaMapper } from "../../../mappers/user-prisma.mapper";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async page(params: SearchInput): Promise<Page<UserEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";
    const allowedSortBy = new Set<keyof Prisma.UserOrderByWithRelationInput>([
      "name",
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
          OR: [
            { name: { contains: filter, mode: "insensitive" } },
            { email: { contains: filter, mode: "insensitive" } },
          ],
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
      content: users.map(UserPrismaMapper.toDomain),
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
    return UserPrismaMapper.toDomain(user);
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return false;
    return true;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return UserPrismaMapper.toDomain(user);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return false;
    return true;
  }

  async create(entity: UserEntity): Promise<UserEntity> {
    const data = UserPrismaMapper.toPersistence(entity);

    const user = await this.prisma.user.create({ data });

    return UserPrismaMapper.toDomain(user);
  }

  async createWithTx(
    entity: UserEntity,
    tx: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const data = UserPrismaMapper.toPersistence(entity);
    const user = await tx.user.create({ data });
    return UserPrismaMapper.toDomain(user);
  }

  async save(entity: UserEntity): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: entity.id.toString() },
      data: {
        firstName: entity.firstName,
        lastName: entity.lastName,
        cpf: entity.cpf.getValue(),
      },
    });

    return UserPrismaMapper.toDomain(user);
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

    return users.map(UserPrismaMapper.toDomain);
  }
}
