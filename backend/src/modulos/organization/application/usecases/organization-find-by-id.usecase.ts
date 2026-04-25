import { BaseUseCase } from "@/common/application/usecase/base-usecase";
import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { NotFoundError } from "@/common/domain/errors/usecases/not-founde.rror";
import { OrganizationMapper } from "../../domain/mappers/organization.mapper";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";
import { OrganizationParams } from "../../infrastructure/http/schemas/organization.shema";
import { OrganizationPresentDto } from "../dto/organization-present.dto";

export type OrganizationFindByIdUseCaseResponse = Either<
  BadRequestError | NotFoundError,
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
      organization: OrganizationMapper.toOutput(organization),
    });
  }
}
