import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { NotFoundError } from "@/common/domain/errors/usecases/not-founde.rror";

import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";
import { OrganizationParams } from "../../schemas/organization.shema";

export type OrganizationFindByIdUseCaseResponse = Either<
  BadRequestError | NotFoundError,
  { organization: OrganizationEntity }
>;

export class OrganizationFindByIdUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute({
    organizationId,
  }: OrganizationParams): Promise<OrganizationFindByIdUseCaseResponse> {
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

    return right({
      organization,
    });
  }
}
