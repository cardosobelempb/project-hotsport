import { BaseUseCase } from "@/common/application/usecase/base-usecase";
import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { NotFoundError } from "@/common/domain/errors/usecases/not-founde.rror";
import { OrganizationAlreadyInactiveError } from "../../domain/errors/organization-already-inactive.error";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";
import { OrganizationParams } from "../../infrastructure/http/schemas/organization.shema";

export type OrganizationActivateUseCaseResponse = Either<
  BadRequestError | NotFoundError | OrganizationAlreadyInactiveError,
  { message: string }
>;

export class OrganizationActivateUseCase implements BaseUseCase<
  OrganizationParams,
  OrganizationActivateUseCaseResponse
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
  }: OrganizationParams): Promise<OrganizationActivateUseCaseResponse> {
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

    organization.activate();

    await this.organizationRepository.save(organization);

    return right({ message: "Organization activated successfully" });
  }
}
