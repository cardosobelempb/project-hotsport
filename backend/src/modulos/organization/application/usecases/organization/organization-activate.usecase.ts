import { BaseUseCase } from "@/common/application/usecase/base-usecase";
import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";

import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { NotFoundError } from "@/common/domain/errors/usecases/not-founde.rror";
import { OrganizationParams } from "@/modulos/organization/application/schemas/organization.shema";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";

export type OrganizationActivateUseCaseResponse = Either<
  BadRequestError | NotFoundError | AlreadyExistsError,
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
