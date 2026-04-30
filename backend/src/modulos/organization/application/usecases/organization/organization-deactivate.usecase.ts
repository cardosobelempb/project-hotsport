import { BaseUseCase } from "@/common/application/usecase/base-usecase";
import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { NotFoundError } from "@/common/domain/errors/usecases/not-founde.rror";
import { OrganizationParams } from "@/modulos/organization/application/schemas/organization.shema";
import { OrganizationAlreadyInactiveError } from "@/modulos/organization/domain/errors/organization-already-inactive.error";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";

export type OrganizationDeactivateUseCaseResponse = Either<
  BadRequestError | NotFoundError | OrganizationAlreadyInactiveError,
  { message: string }
>;

export class OrganizationDeactivateUseCase implements BaseUseCase<
  OrganizationParams,
  OrganizationDeactivateUseCaseResponse
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
  }: OrganizationParams): Promise<OrganizationDeactivateUseCaseResponse> {
    if (!organizationId) {
      return left(
        new BadRequestError({
          fieldName: "organizationId",
          value: `${organizationId}`,
          message: "Organization ID is required",
        }),
      );
    }

    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(
        new NotFoundError({
          fieldName: "organizationId",
          value: organizationId,
          message: "Organization not found",
        }),
      );
    }

    organization.inactive();

    await this.organizationRepository.save(organization);

    return right({
      message: "Organization deactivated successfully",
    });
  }
}
