export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface OrganizationInputDto extends Omit<
  OrganizationDto,
  "id" | "createdAt" | "updatedAt" | "isActive"
> {
  name: string;
  slug: string;
  logoUrl: string;
}

export interface OrganizationOutputDto extends Omit<
  OrganizationDto,
  "updatedAt"
> {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrganizationOptionalDto extends Partial<OrganizationDto> {}
