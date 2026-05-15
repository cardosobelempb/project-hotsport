import z from "zod";

export enum SubscriptionPlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

export const PlanStatusSchema = z.enum(SubscriptionPlanStatus);
