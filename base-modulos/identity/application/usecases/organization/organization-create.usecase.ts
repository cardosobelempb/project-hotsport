import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";

import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { ConflictError } from "@/common/domain/errors/usecases/conflict.error";

import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { OrganizationMapper } from "@/modulos/identity/application/mappers/organization.mapper";
import { OrganizationRepository } from "@/modulos/identity/domain/repositories/organization.repository";
import {
  CreateOrganizationDto,
  OrganizationSummaryDto,
} from "../../dto/organization.dto";
import { OrganizationFactory } from "../../factories/organization.factory";

export type OrganizationCreateUseCaseResponse = Either<
  AlreadyExistsError,
  OrganizationSummaryDto
>;

export class OrganizationCreateUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    input: CreateOrganizationDto,
  ): Promise<OrganizationCreateUseCaseResponse> {
    const organizationWithSameSlug =
      await this.organizationRepository.findBySlug(input.slug);

    if (organizationWithSameSlug) {
      return left(
        new ConflictError({
          fieldName: "slug",
          value: input.slug,
          message: `Slug "${input.slug}" já existe`,
        }),
      );
    }

    const organization = OrganizationFactory.build({
      name: input.name,
      slug: SlugVO.create(input.slug),
      logoUrl: input.logoUrl,
    });

    const createdOrganization =
      await this.organizationRepository.create(organization);

    return right(OrganizationMapper.toSummary(createdOrganization));
  }
}
