import { PageRepository } from "@/common/domain/repositories/page-repository";
import { OrganizationEntity } from "../entities/organization.entity";

export abstract class OrganizationRepository extends PageRepository<OrganizationEntity> {
  abstract findBySlug(slug: string): Promise<OrganizationEntity | null>;
  abstract existsBySlug(slug: string): Promise<boolean>;
}
