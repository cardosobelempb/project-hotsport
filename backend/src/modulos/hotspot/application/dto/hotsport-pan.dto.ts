import { HotspotPlanTypeDto } from "@/shared/enums/hotspot-plan-type.enum";

interface HotsportPlanDto {
  id: string;
  organizationId: string;
  name: string;
  duratioSec: number;
  dataLimitMb: number;
  type: HotspotPlanTypeDto;
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
  type: HotspotPlanTypeDto;
  createdAt: string;
}

export interface HotsportPlanOptionalDto extends Partial<HotsportPlanDto> {}
