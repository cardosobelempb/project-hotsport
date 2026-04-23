import { BaseUseCase } from "@/core/application";
import { Either, right } from "@/core/domain/errors/handle-errors";

import { OrganizationMapper } from "../../domain/mappers/organization.mapper";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";
import {
  OrganizationSearchDto,
  OrganizationSearchPresentDto,
} from "../dto/organization-search.dto";

export type OrganizationsSearchUseCaseResponse = Either<
  null,
  OrganizationSearchPresentDto
>;

export class OrganizationSearchUseCase implements BaseUseCase<
  OrganizationSearchDto,
  OrganizationsSearchUseCaseResponse
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    input: OrganizationSearchDto,
  ): Promise<OrganizationsSearchUseCaseResponse> {
    const result = await this.organizationRepository.search({
      page: input.page ?? 1,
      perPage: input.perPage ?? 15,
      filter: input.filter ?? "",
      sortBy: input.sortBy ?? "createdAt",
      sortDirection: input.sortDirection ?? "desc",
    });

    return right({
      items: result.items.map(OrganizationMapper.toOutput),
      meta: {
        currentPage: result.currentPage,
        perPage: result.perPage,
        total: result.total,
        totalPages: result.totalPages,
        sortBy: result.sortBy,
        sortDirection: result.sortDirection,
        filter: result.filter,
      },
    });
  }
}
