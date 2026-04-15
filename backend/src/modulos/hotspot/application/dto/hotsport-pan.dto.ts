import { HotspotPlanType } from "../../domain/enums/hotsport-plan.enuns";

export interface HotsportPlanDto {
  id: string;
  organizationId: string;
  name: string;
  duratioSec: number;
  dataLimitMb: number;
  type: HotspotPlanType;
  createAt: string;
  updatedAt: string | null;
}

export interface HotsportPlanInputDto extends Omit<
  HotsportPlanDto,
  "id" | "createdAt" | "updatedAt" | "type"
> {
  organizationId: string;
  name: string;
  duratioSec: number;
  dataLimitMb: number;
}

export interface HotsportPlanOutputDto extends Omit<
  HotsportPlanDto,
  "updatedAt"
> {
  id: string;
  organizationId: string;
  name: string;
  duratioSec: number;
  dataLimitMb: number;
  type: HotspotPlanType;
  createAt: string;
}

export interface HotsportPlanOptionalDto extends Partial<HotsportPlanDto> {}
