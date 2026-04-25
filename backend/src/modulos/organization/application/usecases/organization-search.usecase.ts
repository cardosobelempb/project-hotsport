import { BaseUseCase } from "@/common/application/usecase/base-usecase";
import { Either, right } from "@/common/domain/errors/handle-errors";
import { BasePaginatedResponse } from "@/common/infrastructure/repositories/base-paginated-response";
import { OrganizationMapper } from "../../domain/mappers/organization.mapper";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";
import { PaginatedResponseDto } from "../../infrastructure/http/schemas/organization-search.shema";
import { OrganizationPresentDto } from "../dto/organization-present.dto";
import { OrganizationSearchDto } from "../dto/organization-search.dto";

export type OrganizationsSearchUseCaseResponse = Either<
  null,
  PaginatedResponseDto<OrganizationPresentDto>
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
    /**
     * Busca no repositório
     */
    const result = await this.organizationRepository.search(input);

    /**
     * Mapeia entidades → DTO de apresentação
     */
    const organizations = result.items.map((organization) =>
      OrganizationMapper.toOutput(organization),
    );

    /**
     * Converte para o padrão:
     *
     * {
     *   content,
     *   pageable,
     *   last,
     *   totalPages,
     *   totalElements,
     *   size,
     *   number,
     *   sort,
     *   first,
     *   numberOfElements,
     *   empty
     * }
     */
    const paginatedResponse = BasePaginatedResponse.fromSearchOutput({
      items: organizations,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      perPage: result.perPage,
      sortBy: result.sortBy,
      sortDirection: result.sortDirection,
    });

    /**
     * Retorno final
     */
    return right(paginatedResponse);
  }
}
