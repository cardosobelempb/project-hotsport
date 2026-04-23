import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";
import { OrganizationEntity } from "../entities/organization.entity";

export abstract class OrganizationRepository extends BaseSearchableRepository<OrganizationEntity> {
  abstract findBySlug(slug: string): Promise<OrganizationEntity | null>;
  abstract existsBySlug(slug: string): Promise<boolean>;
}
