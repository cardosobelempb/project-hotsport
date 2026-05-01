import { getPrismaClient } from "@/common/infrastructure/db/prisma.client";

import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";

import {
  Page,
  PageInput,
  Sort,
} from "@/common/domain/repositories/types/pagination.types";
import { Prisma } from "../../../../../../../generated/prisma";
import { OrganizationPrismaMapper } from "../../mappers/prisma/organization-prisma.mapper";

export class OrganizationPrismaRepository implements OrganizationRepository {
  private prisma = getPrismaClient();

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) return null;

    return organization
      ? OrganizationPrismaMapper.toDomain(organization)
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
      content: organizations.map(OrganizationPrismaMapper.toDomain),
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
      ? OrganizationPrismaMapper.toDomain(organization)
      : null;
  }
  async create(entity: OrganizationEntity): Promise<OrganizationEntity> {
    const organization = OrganizationPrismaMapper.toPersistence(entity);

    const createdOrganization = await this.prisma.organization.create({
      data: organization,
    });

    return OrganizationPrismaMapper.toDomain(createdOrganization);
  }
  async exists(id: string): Promise<boolean> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!organization;
  }
  async save(entity: OrganizationEntity): Promise<OrganizationEntity> {
    const organization = OrganizationPrismaMapper.toUpdatePersistence(entity);

    const updatedOrganization = await this.prisma.organization.update({
      where: { id: entity.id.getValue() },
      data: organization,
    });

    return OrganizationPrismaMapper.toDomain(updatedOrganization);
  }
  async delete(entity: OrganizationEntity): Promise<void> {
    await this.prisma.organization.delete({
      where: { id: entity.id.getValue() },
    });
  }
}
