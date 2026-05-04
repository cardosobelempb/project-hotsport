import {
  Page,
  PageInput,
} from "@/common/domain/repositories/types/pagination.types";
import { getPrismaClient } from "@/common/infrastructure/db/prisma.client";
import { Prisma } from "../../../../../../../generated/prisma";
import { AccountEntity } from "../../../../domain/entities/account.entity";
import { AccountRepository } from "../../../../domain/repositories/account-repository";
import { AccountMapper } from "../../../mappers/account.mapper";

export class AccountPrismaRepository implements AccountRepository {
  private prisma = getPrismaClient();

  async page(params: PageInput): Promise<Page<AccountEntity>> {
    const page = params.page ?? 1;
    const size = params.size ?? 20;
    const skip = (page - 1) * size;

    const sortParam = params.sort ?? "createdAt,desc";
    const [rawSortBy, rawSortDir] = sortParam.split(",");
    const allowedSortFields: Array<
      keyof Prisma.AccountOrderByWithRelationInput
    > = ["createdAt", "updatedAt"];
    const sortBy = allowedSortFields.includes(
      rawSortBy as keyof Prisma.AccountOrderByWithRelationInput,
    )
      ? (rawSortBy as keyof Prisma.AccountOrderByWithRelationInput)
      : "createdAt";
    const sortDirection: Prisma.SortOrder =
      rawSortDir === "asc" ? "asc" : "desc";

    const filter = params.filter?.trim() ?? "";
    const where = filter
      ? {
          OR: [
            { provider: { contains: filter, mode: "insensitive" } },
            { providerAccountId: { contains: filter, mode: "insensitive" } },
          ],
        }
      : {};

    const [totalElements, accounts] = await this.prisma.$transaction([
      this.prisma.account.count({ where }),
      this.prisma.account.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip,
        take: size,
        include: { members: true },
      }),
    ]);

    return {
      content: accounts.map(AccountMapper.toDomain),
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: {
          sorted: !!params.sort,
          unsorted: !params.sort,
          empty: !params.sort,
        },
      },
      totalPages: Math.ceil(totalElements / size),
      totalElements,
      last: page * size >= totalElements,
      size,
      number: page,
      numberOfElements: accounts.length,
      first: page === 1,
      empty: accounts.length === 0,
    };
  }

  async findByUserId(userId: string): Promise<AccountEntity | null> {
    const account = await this.prisma.account.findFirst({
      where: { members: { some: { userId } } },
      include: { members: true },
    });
    if (!account) return null;
    return AccountMapper.toDomain(account);
  }

  async findById(id: string): Promise<AccountEntity | null> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!account) return null;
    return AccountMapper.toDomain(account);
  }

  async exists(id: string): Promise<boolean> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    return !!account;
  }

  async findByEmail(email: string): Promise<AccountEntity | null> {
    const account = await this.prisma.account.findFirst({
      where: {
        members: {
          some: {
            user: {
              email: {
                contains: email,
                mode: "insensitive",
              },
            },
          },
        },
        providerAccountId: email,
      },
    });

    if (!account) return null;
    return AccountMapper.toDomain(account);
  }

  async create(entity: AccountEntity): Promise<AccountEntity> {
    const data = AccountMapper.toPersist(entity);

    const account = await this.prisma.account.create({
      data,
    });

    return AccountMapper.toDomain(account);
  }

  async createWithTx(
    entity: AccountEntity,
    tx: Prisma.TransactionClient,
  ): Promise<AccountEntity> {
    const data = AccountMapper.toPersist(entity);
    const account = await tx.account.create({ data });
    return AccountMapper.toDomain(account);
  }

  async save(entity: AccountEntity): Promise<AccountEntity> {
    const account = await this.prisma.account.update({
      where: { id: entity.id.toString() },
      data: {
        userId: entity.userId.toString(),
        passwordHash: entity.passwordHash ?? "",
      },
    });

    return AccountMapper.toDomain(account);
  }

  async delete(entity: AccountEntity): Promise<void> {
    await this.prisma.account.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findManyByIds(ids: string[]): Promise<AccountEntity[]> {
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: ids } },
      include: { members: true },
    });

    return accounts.map(AccountMapper.toDomain);
  }
}
