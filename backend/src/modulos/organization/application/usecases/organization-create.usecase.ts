import { BaseUseCase } from "@/core/application";
import { Either, left, right } from "@/core/domain/errors/handle-errors";
import { AlreadyExistsError } from "@/core/domain/errors/usecases/already-exists.error";
import { SlugVO } from "@/core/domain/values-objects/slug/slug.vo";

import { OrganizationEntity } from "../../domain/entities/organization.entity";
import { OrganizationMapper } from "../../domain/mappers/organization.mapper";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";

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
        new AlreadyExistsError(
          `Organization with slug "${slug.getValue()}" already exists`,
        ),
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
