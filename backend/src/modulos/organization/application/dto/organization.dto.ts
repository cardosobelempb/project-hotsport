interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface OrganizationRawDto extends Omit<
  OrganizationDto,
  "createdAt" | "updatedAt" | "isActive" | "deletedAt" | "status"
> {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface OrganizationInputDto extends Omit<
  OrganizationDto,
  "id" | "createdAt" | "updatedAt" | "isActive" | "deletedAt" | "status"
> {
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface OrganizationOutputDto extends Omit<
  OrganizationDto,
  "updatedAt" | "deletedAt"
> {
  id: string;
  name: string;
  status: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface OrganizationOptionalDto extends Partial<OrganizationDto> {}
