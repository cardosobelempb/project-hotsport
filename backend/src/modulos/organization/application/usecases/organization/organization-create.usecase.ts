import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";

import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { ConflictError } from "@/common/domain/errors/usecases/conflict.error";

import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";
import { OrganizationMapper } from "@/modulos/organization/domain/mappers/organization.mapper";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";
import { OrganizationPresentDto } from "../../dto/organization.dto";
import { CreateOrganizationInput } from "../../schemas/organization.shema";

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
