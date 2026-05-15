import { SubscriptionStatusDto } from "./subscription-status.dto";

interface SubscriptionDto {
  id: string;
  organizationId: string;
  subscriptionPlanId: string;
  status: SubscriptionStatusDto;
  billingCycle: string;
  amount: Number;
  currency: string;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  startsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface SubscriptionRawDto extends Omit<
  SubscriptionDto,
  | "status"
  | "canceledAt"
  | "expiresAt"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> {
  id: string;
  organizationId: string;
  subscriptionPlanId: string;
  status: SubscriptionStatusDto;
  billingCycle: string;
  amount: Number;
  currency: string;
  startsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface SubscriptionInputDto extends Omit<
  SubscriptionDto,
  | "id"
  | "status"
  | "canceledAt"
  | "expiresAt"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> {
  organizationId: string;
  subscriptionPlanId: string;
  status: SubscriptionStatusDto;
  billingCycle: string;
  amount: Number;
  currency: string;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  startsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  expiresAt: string | null;
}

export interface SubscriptionOutputDto extends Omit<
  SubscriptionDto,
  "canceledAt" | "expiresAt" | "createdAt" | "updatedAt" | "deletedAt"
> {
  id: string;
  organizationId: string;
  subscriptionPlanId: string;
  status: SubscriptionStatusDto;
  billingCycle: string;
  amount: Number;
  currency: string;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  startsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface SubscriptionOptionalDto extends Partial<SubscriptionDto> {}
