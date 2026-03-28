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

export function mapPlan(p: {
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
}): PlanOutputDto {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    amount: Number(p.amount),
    durationMinutes: p.durationMinutes,
    downloadSpeed: p.downloadSpeed,
    uploadSpeed: p.uploadSpeed,
    mikrotikId: p.mikrotikId,
    active: p.active,
    addressPool: p.addressPool,
    sharedUsers: p.sharedUsers,
  };
}
