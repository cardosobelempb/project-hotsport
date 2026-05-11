import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { NotFoundError } from "@/common/domain/errors/usecases/not-founde.rror";

import { OrganizationMapper } from "@/modulos/identity/domain/mappers/organization.mapper";
import { OrganizationRepository } from "@/modulos/identity/domain/repositories/organization.repository";
import { OrganizationParams } from "@/modulos/identity/infrastructure/http/schemas/organization.schema";
import { OrganizationSummaryDto } from "../../dto/organization.dto";

export type OrganizationFindByIdUseCaseResponse = Either<
  BadRequestError | NotFoundError,
  OrganizationSummaryDto
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

    return right(OrganizationMapper.toSummary(organization));
  }
}
