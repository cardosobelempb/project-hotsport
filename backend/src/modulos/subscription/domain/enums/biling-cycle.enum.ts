import z from "zod";

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMIANNUAL = "SEMIANNUAL",
  YEARLY = "YEARLY",
}

export const BillingCycleSchema = z.enum(BillingCycle);
