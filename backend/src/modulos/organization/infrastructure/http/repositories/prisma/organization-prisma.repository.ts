import { getPrismaClient } from "@/common/infrastructure/db/prisma.client";

import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";

import {
  SearchInput,
  SearchOutput,
} from "@/common/domain/repositories/search.repository";
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
  async search(params: SearchInput): Promise<SearchOutput<OrganizationEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";

    /**
     * Campos permitidos para ordenação
     */
    const allowedSortBy: Array<
      keyof Prisma.OrganizationOrderByWithRelationInput
    > = ["name", "slug", "status", "createdAt", "updatedAt"];

    const sortBy = allowedSortBy.includes(
      params.sortBy as keyof Prisma.OrganizationOrderByWithRelationInput,
    )
      ? (params.sortBy as keyof Prisma.OrganizationOrderByWithRelationInput)
      : "createdAt";

    /**
     * Filtro
     */
    const where = this.buildWhere(filter);

    const skip = (page - 1) * perPage;

    /**
     * Query paginada
     */
    const [total, organizations] = await this.prisma.$transaction([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip,
        take: perPage,
      }),
    ]);

    /**
     * Retorno compatível com
     * PaginatedResponseDto.fromSearchOutput()
     */

    return {
      items: organizations.map(OrganizationPrismaMapper.toDomain),
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: page,
      perPage,
      sortBy,
      sortDirection,
      filter,
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
