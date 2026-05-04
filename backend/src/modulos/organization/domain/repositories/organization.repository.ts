import { PageRepository } from "@/common/domain/repositories/page-repository";
import { OrganizationEntity } from "../entities/organization.entity";

export abstract class OrganizationRepository extends PageRepository<OrganizationEntity> {
  abstract findBySlug(slug: string): Promise<OrganizationEntity | null>;
  abstract existsBySlug(slug: string): Promise<boolean>;

  abstract findByIdAndAccountId(
    id: string,
    accountId: string,
  ): Promise<OrganizationEntity | null>;

  abstract findByDocument(document: string): Promise<OrganizationEntity | null>;

  abstract findBySlugAndAccountId(
    slug: string,
    accountId: string,
  ): Promise<OrganizationEntity | null>;

  abstract existsById(id: string): Promise<boolean>;

  abstract existsByDocument(document: string): Promise<boolean>;

  abstract existsBySlugAndAccountId(
    slug: string,
    accountId: string,
  ): Promise<boolean>;

  // abstract findManyByAccountId(params: {
  //   accountId: string;
  //   page: number;
  //   perPage: number;
  //   search?: string;
  //   status?: OrganizationStatus;
  // }): Promise<OrganizationSearchResult>;

  abstract countByAccountId(accountId: string): Promise<number>;
}
