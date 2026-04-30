import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { ConflictError } from "@/common/domain/errors/usecases/conflict.error";
import { NotFoundError } from "@/common/domain/errors/usecases/not-founde.rror";

import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";

import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";
import {
  OrganizationParams,
  UpdateOrganizationInput,
} from "../../schemas/organization.shema";

export type OrganizationUpdateUseCaseResponse = Either<
  BadRequestError | NotFoundError | ConflictError | AlreadyExistsError,
  { organization: OrganizationEntity }
>;

export class OrganizationUpdateUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    { organizationId }: OrganizationParams,
    input: UpdateOrganizationInput,
  ): Promise<OrganizationUpdateUseCaseResponse> {
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

    if (input.slug !== undefined) {
      const normalizedSlug = SlugVO.create(input.slug || "");

      if (normalizedSlug.getValue() !== organization.slug.getValue()) {
        const organizationWithSameSlug =
          await this.organizationRepository.findBySlug(
            normalizedSlug.getValue(),
          );

        if (
          organizationWithSameSlug &&
          organizationWithSameSlug.id !== organization.id
        ) {
          return left(
            new ConflictError({
              fieldName: "slug",
              value: normalizedSlug.getValue(),
              message: "Organization slug already exists",
            }),
          );
        }

        organization.changeSlug(normalizedSlug);
      }
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
      organization,
    });
  }
}
