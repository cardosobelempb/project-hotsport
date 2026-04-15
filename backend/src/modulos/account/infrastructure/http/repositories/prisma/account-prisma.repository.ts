import {
  SearchInput,
  SearchOutput,
} from "@/core/domain/repositories/search.repository";

import { getPrismaClient } from "@/core/infrastructure/db/prisma.client";
import { Prisma } from "../../../../../../../generated/prisma";
import { AccountEntity } from "../../../../domain/entities/account.entity";
import { AccountRepository } from "../../../../domain/repositories/account-repository";
import { AccountMapper } from "../../../mappers/account.mapper";

export class AccountPrismaRepository implements AccountRepository {
  private prisma = getPrismaClient();

  async search(params: SearchInput): Promise<SearchOutput<AccountEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";
    const allowedSortBy = new Set<keyof Prisma.AccountOrderByWithRelationInput>(
      ["userId", "provider"],
    );
    const sortBy =
      params.sortBy &&
      allowedSortBy.has(
        params.sortBy as keyof Prisma.AccountOrderByWithRelationInput,
      )
        ? params.sortBy
        : "userId";

    const where: Prisma.AccountWhereInput = filter
      ? {
          OR: [{ provider: { contains: filter, mode: "insensitive" } }],
        }
      : {};

    const [total, accounts] = await this.prisma.$transaction([
      this.prisma.account.count({ where }),
      this.prisma.account.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      items: accounts.map(AccountMapper.toDomain),
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: page,
      perPage,
      sortBy,
      sortDirection,
      filter,
    };
  }

  async findByUserId(userId: string): Promise<AccountEntity | null> {
    const account = await this.prisma.account.findFirst({
      where: { userId },
      include: { user: true },
    });
    if (!account) return null;
    return AccountMapper.toDomain(account);
  }

  async findById(id: string): Promise<AccountEntity | null> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!account) return null;
    return AccountMapper.toDomain(account);
  }

  async findByEmail(email: string): Promise<AccountEntity | null> {
    const account = await this.prisma.account.findFirst({
      where: {
        provider: "credentials",
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
}
