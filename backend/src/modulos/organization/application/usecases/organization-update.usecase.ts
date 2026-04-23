import { Either, left, right } from "@/core/domain/errors/handle-errors";
import { SlugVO } from "@/core/domain/values-objects/slug/slug.vo";

import { OrganizationMapper } from "../../domain/mappers/organization.mapper";
import { OrganizationRepository } from "../../domain/repositories/organization.repository";

import { OrganizationNotFoundError } from "../../domain/errors/organization-not-found.error";
import { OrganizationSlugAlreadyExistsError } from "../../domain/errors/organization-slug-already-exists.error";

import { OrganizationParams } from "../../infrastructure/http/schemas/organization.shema";
import { OrganizationPresentDto } from "../dto/organization-present.dto";
import { OrganizationUpdateDto } from "../dto/organization-update.dto";

export type OrganizationUpdateUseCaseResponse = Either<
  OrganizationNotFoundError | OrganizationSlugAlreadyExistsError,
  { organization: OrganizationPresentDto }
>;

export class OrganizationUpdateUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    { organizationId }: OrganizationParams,
    input: OrganizationUpdateDto,
  ): Promise<OrganizationUpdateUseCaseResponse> {
    if (!organizationId) {
      return left(new OrganizationNotFoundError(`Organization id is required`));
    }

    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(
        new OrganizationNotFoundError(
          `Organization with id "${organizationId}" not found`,
        ),
      );
    }

    if (input.slug) {
      const normalizedSlug = SlugVO.create(input.slug);

      const organizationWithSameSlug =
        await this.organizationRepository.findBySlug(normalizedSlug.getValue());

      if (
        organizationWithSameSlug &&
        organizationWithSameSlug.id !== organization.id
      ) {
        return left(
          new OrganizationSlugAlreadyExistsError(normalizedSlug.getValue()),
        );
      }

      organization.changeSlug(normalizedSlug);
    }

    if (input.name !== undefined) {
      organization.changeName(input.name);
    }

    if (input.logoUrl !== undefined) {
      organization.changeLogoUrl(input.logoUrl);
    }

    const updatedOrganization =
      await this.organizationRepository.save(organization);

    return right({
      organization: OrganizationMapper.toOutput(updatedOrganization),
    });
  }
}
