import { OrganizationStatus } from "../../domain/enums/organization.enum";

export interface OrganizationPresentDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  status: OrganizationStatus;
  createdAt: string;
}
