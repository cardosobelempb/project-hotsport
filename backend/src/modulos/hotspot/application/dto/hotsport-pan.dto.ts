import { HotspotPlanType } from "../../domain/enums/hotsport-plan.enuns";

interface HotsportPlanDto {
  id: string;
  organizationId: string;
  name: string;
  duratioSec: number;
  dataLimitMb: number;
  type: HotspotPlanType;
  createdAt: string;
  updatedAt: string | null;
}

export interface HotsportPlanRawDto extends Omit<
  HotsportPlanDto,
  "createdAt" | "updatedAt" | "type"
> {
  id: string;
  organizationId: string;
  name: string;
  duratioSec: number;
  dataLimitMb: number;
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
  createdAt: string;
}

export interface HotsportPlanOptionalDto extends Partial<HotsportPlanDto> {}
