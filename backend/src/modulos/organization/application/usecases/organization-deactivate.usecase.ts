import { ParamsIdString } from "@/shared/schemas/generic";

import { BaseUseCase } from "@/common/application/usecase/BaseUseCase";
import { Either, left, right } from "@/core/domain/errors/handle-errors";
import { RequiredFieldError } from "@/shared/errors/required-field.error";
import { OrganizationAlreadyInactiveError } from "../../domain/errors/organization-already-inactive.error";
import { OrganizationNotFoundError } from "../../domain/errors/organization-not-found.error";
import { OrganizationMapper } from "../../domain/mappers/organization.mapper";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";
import { OrganizationPresentDto } from "../dto/organization-present.dto";

export type OrganizationDeactivateUseCaseResponse = Either<
  | RequiredFieldError
  | OrganizationNotFoundError
  | OrganizationAlreadyInactiveError,
  { organization: OrganizationPresentDto }
>;

export class OrganizationDeactivateUseCase implements BaseUseCase<
  ParamsIdString,
  OrganizationDeactivateUseCaseResponse
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    input: ParamsIdString,
  ): Promise<OrganizationDeactivateUseCaseResponse> {
    if (!input.id) {
      return left(new RequiredFieldError("id"));
    }

    const organization = await this.organizationRepository.findById(input.id);

    if (!organization) {
      return left(new OrganizationNotFoundError(input.id));
    }

    if (!organization.isActive) {
      return left(
        new OrganizationAlreadyInactiveError(
          `Organization with id "${input.id}" is already inactive`,
        ),
      );
    }

    organization.deactivate();

    const updatedOrganization =
      await this.organizationRepository.save(organization);

    return right({
      organization: OrganizationMapper.toOutput(updatedOrganization),
    });
  }
}
