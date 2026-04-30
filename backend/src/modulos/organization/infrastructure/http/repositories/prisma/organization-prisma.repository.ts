import { getPrismaClient } from "@/common/infrastructure/db/prisma.client";

import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";

import {
  Page,
  SearchInput,
} from "@/common/domain/repositories/search.repository";
import { Sort } from "@/common/domain/repositories/types/pagination.types";
import {
  OrganizationStatus,
  Prisma,
} from "../../../../../../../generated/prisma";
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
  async page(params: SearchInput): Promise<Page<OrganizationEntity>> {
    // ─── Paginação (zero-based, padrão Spring Boot) ───────────────────────
    const pageNumber = params.page ?? 0; // Spring começa em 0, não em 1
    const size = params.page ?? 20; // Padrão Spring Data: 20
    const skip = pageNumber * size; // offset = page * size

    // ─── Ordenação (parse do formato 'campo,direção') ──────────────────────
    const [rawSortBy = "createdAt", rawSortDir = "desc"] = (
      params.sortBy ?? "createdAt,desc"
    ).split(",");

    const allowedSortFields: Array<
      keyof Prisma.OrganizationOrderByWithRelationInput
    > = ["name", "slug", "status", "createdAt", "updatedAt"];

    // Garante que somente campos permitidos sejam usados (evita SQL injection por campo)
    const sortBy = allowedSortFields.includes(
      rawSortBy as keyof Prisma.OrganizationOrderByWithRelationInput,
    )
      ? (rawSortBy as keyof Prisma.OrganizationOrderByWithRelationInput)
      : "createdAt";

    // Garante que a direção seja apenas 'asc' ou 'desc'
    const sortDirection: Prisma.SortOrder =
      rawSortDir === "asc" ? "asc" : "desc";

    const isSorted = !!params.sortBy;

    // ─── Filtro ────────────────────────────────────────────────────────────
    const filter = params.filter?.trim() ?? "";
    const where = this.buildWhere(filter);

    // ─── Query paginada em transação atômica ──────────────────────────────
    const [totalElements, organizations] = await this.prisma.$transaction([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
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
      content: organizations.map(OrganizationPrismaMapper.toDomain),

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

  private buildWhere(filter: string): Prisma.OrganizationWhereInput {
    if (!filter) return {};

    return {
      OR: [
        { name: { contains: filter, mode: "insensitive" } },
        { slug: { contains: filter, mode: "insensitive" } },
        {
          status: { equals: filter.toLocaleUpperCase() as OrganizationStatus },
        },
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
