import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";

import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { ConflictError } from "@/common/domain/errors/usecases/conflict.error";

import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { OrganizationEntity } from "@/modulos/identity/domain/entities/organization.entity";
import { OrganizationRepository } from "@/modulos/identity/domain/repositories/organization.repository";
import { OrganizationMapper } from "@/modulos/organization/domain/mappers/organization.mapper";
import { CreateOrganizationInput } from "../../../../organization/application/schemas/organization.shema";
import { OrganizationPresentDto } from "../../dto/organization.dto";

export type OrganizationCreateUseCaseResponse = Either<
  AlreadyExistsError,
  OrganizationPresentDto
>;

export class OrganizationCreateUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    input: CreateOrganizationInput,
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

    const organization = OrganizationEntity.create({
      name: input.name,
      slug: SlugVO.create(input.slug),
      logoUrl: input.logoUrl ?? null,
    });

    const createdOrganization =
      await this.organizationRepository.create(organization);

    return right(OrganizationMapper.toCreate(createdOrganization));
  }
}
