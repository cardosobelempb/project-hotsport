import { BaseUseCase } from "@/core/application";
import { Either, left, right } from "@/core/domain/errors/handle-errors";

import { OrganizationNotFoundError } from "../../domain/errors/organization-not-found.error";
import { OrganizationMapper } from "../../domain/mappers/organization.mapper";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";
import { OrganizationParams } from "../../infrastructure/http/schemas/organization.shema";
import { OrganizationPresentDto } from "../dto/organization-present.dto";

export type OrganizationFindByIdUseCaseResponse = Either<
  OrganizationNotFoundError,
  { organization: OrganizationPresentDto }
>;

export class OrganizationFindByIdUseCase implements BaseUseCase<
  OrganizationParams,
  OrganizationFindByIdUseCaseResponse
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
  }: OrganizationParams): Promise<OrganizationFindByIdUseCaseResponse> {
    if (!organizationId) {
      return left(new OrganizationNotFoundError(`Organization id is required`));
    }

    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(
        new OrganizationNotFoundError(
          `Organization with id "${organizationId}" not found`,
        ),
      );
    }

    return right({
      organization: OrganizationMapper.toOutput(organization),
    });
  }
}
