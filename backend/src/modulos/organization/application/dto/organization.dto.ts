import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { OrganizationStatus } from "../../domain/enums/organization.enum";

export interface OrganizationDto {
  name: string;
  slug: SlugVO;
  logoUrl: string | null;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}
