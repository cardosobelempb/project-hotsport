import { OrganizationEntity } from "@/modulos/identity/domain/entities/organization.entity";

import {
  Page,
  PageInput,
  Sort,
} from "@/common/domain/repositories/types/pagination.types";

import { NotFoundError } from "@/common/domain/errors/usecases/not-founde.rror";
import { PrismaDatabase } from "@/common/infrastructure/db/prisma.client";
import { TOKENS } from "@/common/shared/container/tokens";
import { OrganizationStatus } from "@/common/shared/enums/organization-status-scope.enum";
import { OrganizationRepository } from "@/modulos/identity/domain/repositories/organization.repository";
import { Prisma } from "../../../../../../generated/prisma";
import { PrismaOrganizationMapper } from "../../mappers/organization-prisma.mapper";

export class PrismaOrganizationRepository extends OrganizationRepository {
  static inject = [TOKENS.PRISMA_CLIENT];

  constructor(prisma: PrismaDatabase) {
    super(prisma);
  }

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    if (!slug?.trim()) {
      throw new NotFoundError({
        message: "Slug is required and cannot be empty.",
        fieldName: "slug",
        value: slug,
      });
    }
    const organization = await this.prisma.organization.findUnique({
      where: {
        slug: slug.trim(),
        deletedAt: null,
        status: OrganizationStatus.ACTIVE,
      },
    });

    if (!organization) return null;

    return organization
      ? PrismaOrganizationMapper.toDomain(organization)
      : null;
  }
  async existsBySlug(slug: string): Promise<boolean> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    return !!organization;
  }
  async page(params: PageInput): Promise<Page<OrganizationEntity>> {
    // ─── Paginação zero-based (padrão Spring) ─────────────────────────────
    const pageNumber = params.page ?? 0; // ✅ zero-based — não mais ?? 1
    const size = params.size ?? 20;
    const skip = pageNumber * size; // ✅ 0 * 20 = 0, 1 * 20 = 20...

    // ─── Ordenação ────────────────────────────────────────────────────────
    const [rawSortBy = "createdAt", rawSortDir = "desc"] = (
      params.sort ?? "createdAt,desc"
    ).split(",");

    const allowedSortFields: Array<
      keyof Prisma.OrganizationOrderByWithRelationInput
    > = ["name", "slug", "status", "createdAt", "updatedAt"];

    const sortBy = allowedSortFields.includes(
      rawSortBy as keyof Prisma.OrganizationOrderByWithRelationInput,
    )
      ? (rawSortBy as keyof Prisma.OrganizationOrderByWithRelationInput)
      : "createdAt";

    const sortDirection: Prisma.SortOrder =
      rawSortDir === "asc" ? "asc" : "desc";

    // ─── Filtro ───────────────────────────────────────────────────────────
    const filter = params.filter?.trim() ?? "";
    const where = this.buildWhere(filter);

    // ─── Query ────────────────────────────────────────────────────────────
    const [totalElements, organizations] = await this.prisma.$transaction([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip, // ✅ sempre >= 0
        take: size,
      }),
    ]);

    // ─── Metadados ────────────────────────────────────────────────────────
    const totalPages = Math.ceil(totalElements / size);
    const numberOfElements = organizations.length;
    const isSorted = !!params.sort;

    const sortMeta: Sort = {
      sorted: isSorted,
      unsorted: !isSorted,
      empty: !isSorted,
    };

    return {
      content: organizations.map(PrismaOrganizationMapper.toDomain),
      pageable: {
        sort: sortMeta,
        offset: skip,
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
      number: pageNumber,
      first: pageNumber === 0,
      last: pageNumber >= totalPages - 1,
      empty: numberOfElements === 0,
    };
  }

  private buildWhere(filter: string): Prisma.OrganizationWhereInput {
    if (!filter) return {};

    return {
      OR: [
        { name: { contains: filter, mode: "insensitive" } },
        { slug: { contains: filter, mode: "insensitive" } },
      ],
    };
  }
  async findById(id: string): Promise<OrganizationEntity | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) return null;

    return organization
      ? PrismaOrganizationMapper.toDomain(organization)
      : null;
  }
  async create(entity: OrganizationEntity): Promise<OrganizationEntity> {
    const organization = PrismaOrganizationMapper.toPrisma(entity);

    const createdOrganization = await this.prisma.organization.create({
      data: organization,
    });

    return PrismaOrganizationMapper.toDomain(createdOrganization);
  }
  async exists(id: string): Promise<boolean> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!organization;
  }
  async save(entity: OrganizationEntity): Promise<OrganizationEntity> {
    const organization = PrismaOrganizationMapper.toPrisma(entity);

    const updatedOrganization = await this.prisma.organization.update({
      where: { id: entity.id.getValue() },
      data: organization,
    });

    return PrismaOrganizationMapper.toDomain(updatedOrganization);
  }
  async delete(entity: OrganizationEntity): Promise<void> {
    await this.prisma.organization.delete({
      where: { id: entity.id.getValue() },
    });
  }

  async findActiveById(id: string): Promise<OrganizationEntity | null> {
    const orgnanization = await this.prisma.organization.findUnique({
      where: {
        id,
        deletedAt: null,
        status: OrganizationStatus.ACTIVE,
      },
    });

    if (!orgnanization) return null;

    return orgnanization
      ? PrismaOrganizationMapper.toDomain(orgnanization)
      : null;
  }
  async findActiveBySlug(slug: string): Promise<OrganizationEntity | null> {
    const organization = await this.prisma.organization.findUnique({
      where: {
        slug,
        deletedAt: null,
        status: OrganizationStatus.ACTIVE,
      },
    });

    if (!organization) return null;

    return organization
      ? PrismaOrganizationMapper.toDomain(organization)
      : null;
  }
  async findActiveByDocument(
    document: string,
  ): Promise<OrganizationEntity | null> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        document,
        deletedAt: null,
        status: OrganizationStatus.ACTIVE,
      },
    });

    if (!organization) return null;

    return organization
      ? PrismaOrganizationMapper.toDomain(organization)
      : null;
  }
  async existsActiveById(id: string): Promise<boolean> {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
        deletedAt: null,
        status: OrganizationStatus.ACTIVE,
      },
      select: { id: true },
    });

    return !!organization;
  }
  async existsActiveByDocument(document: string): Promise<boolean> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        document,
        deletedAt: null,
        status: OrganizationStatus.ACTIVE,
      },
      select: { id: true },
    });
    return !!organization;
  }
  async existsActiveBySlug(slug: string): Promise<boolean> {
    const organization = await this.prisma.organization.findUnique({
      where: {
        slug,
        deletedAt: null,
        status: OrganizationStatus.ACTIVE,
      },
      select: { id: true },
    });

    return !!organization;
  }
  async countActiveByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.organization.count({
      where: {
        accountId,
        deletedAt: null,
        status: OrganizationStatus.ACTIVE,
      },
    });

    return count;
  }
  async findBySlugAndAccountId(
    slug: string,
    accountId: string,
  ): Promise<OrganizationEntity | null> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        slug,
        accountId,
        deletedAt: null,
      },
    });

    if (!organization) return null;

    return organization
      ? PrismaOrganizationMapper.toDomain(organization)
      : null;
  }
  async existsBySlugAndAccountId(
    slug: string,
    accountId: string,
  ): Promise<boolean> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        slug,
        accountId,
        deletedAt: null,
      },
      select: { id: true },
    });

    return !!organization;
  }
  async countByAccountId(accountId: string): Promise<number> {
    const count = await this.prisma.organization.count({
      where: {
        accountId,
        deletedAt: null,
      },
    });

    return count;
  }
  async findManyByIds(ids: string[]): Promise<OrganizationEntity[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        id: { in: ids },
      },
    });

    return organizations.map(PrismaOrganizationMapper.toDomain);
  }
}
