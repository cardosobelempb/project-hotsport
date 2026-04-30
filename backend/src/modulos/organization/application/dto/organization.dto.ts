import { DeepPartial } from "@/common/domain/types/DeepPartial";
import { OrganizationStatus } from "@/shared/enums/organization-status.enum";

export interface OrganizationDto {
  id?: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface UpdateOrganizationDto extends DeepPartial<OrganizationDto> {}

export interface OrganizationPresenterDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export const createOrganizationRawExample: OrganizationDto = {
  id: "00000000-0000-4000-8000-000000000000",
  name: "John Doe",
  slug: "john-doe",
  logoUrl: null,
  status: OrganizationStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
};

export const organizationPresenterRawExample: OrganizationPresenterDto = {
  id: "00000000-0000-4000-8000-000000000000",
  name: "John Doe",
  slug: "john-doe",
  logoUrl: null,
  status: OrganizationStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
};
