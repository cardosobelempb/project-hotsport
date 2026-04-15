export interface PlanOutputDto {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  durationMinutes: number;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikId: number;
  active: boolean;
  addressPool: string;
  sharedUsers: number;
}

interface PlanMapperInput {
  id: number;
  name: string;
  description: string | null;
  amount: unknown;
  durationMinutes: number;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikId: number;
  active: boolean;
  addressPool: string;
  sharedUsers: number;
}

export const mapPlan = (plan: PlanMapperInput): PlanOutputDto => ({
  id: plan.id,
  name: plan.name,
  description: plan.description,
  amount: Number(plan.amount),
  durationMinutes: plan.durationMinutes,
  downloadSpeed: plan.downloadSpeed,
  uploadSpeed: plan.uploadSpeed,
  mikrotikId: plan.mikrotikId,
  active: plan.active,
  addressPool: plan.addressPool,
  sharedUsers: plan.sharedUsers,
});
