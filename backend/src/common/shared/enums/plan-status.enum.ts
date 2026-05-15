import z from "zod";

export enum PlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

export const PlanStatusSchema = z.enum(PlanStatus);
