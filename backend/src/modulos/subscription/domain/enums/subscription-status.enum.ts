import z from "zod";

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  SUSPENDED = "SUSPENDED",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
}

export const SubscriptionStatusSchema = z.enum(SubscriptionStatus);
