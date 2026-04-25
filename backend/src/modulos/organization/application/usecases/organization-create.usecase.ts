import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { OrganizationEntity } from "../../domain/entities/organization.entity";
import { OrganizationMapper } from "../../domain/mappers/organization.mapper";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";

import { BaseUseCase } from "@/common/application/usecase/base-usecase";
import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { ConflictError } from "@/common/domain/errors/usecases/conflict.error";
import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { OrganizationCreateDto } from "../dto/organization-create.dto";
import { OrganizationPresentDto } from "../dto/organization-present.dto";

export type OrganizationCreateUseCaseResponse = Either<
  AlreadyExistsError,
  { organization: OrganizationPresentDto }
>;

export class OrganizationCreateUseCase implements BaseUseCase<
  OrganizationCreateDto,
  OrganizationCreateUseCaseResponse
> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    input: OrganizationCreateDto,
  ): Promise<OrganizationCreateUseCaseResponse> {
    const slug = SlugVO.create(input.slug);

    const organizationWithSameSlug =
      await this.organizationRepository.findBySlug(slug.getValue());

    if (organizationWithSameSlug) {
      return left(
        new ConflictError({
          fieldName: "slug",
          value: input.slug,
          message: `Slug "${input.slug}" já existe`,
        }),
      );
    }

    const organizationEntity = OrganizationEntity.create({
      name: input.name,
      slug,
      logoUrl: input.logoUrl ?? null,
    });

    const organization =
      await this.organizationRepository.create(organizationEntity);

    return right({
      organization: OrganizationMapper.toOutput(organization),
    });
  }
}
