import { BillingCycle } from "@/modulos/subscription/domain/enums/biling-cycle.enum";
import { SubscriptionPlanStatus } from "../../domain/enums/subscription-plan-status.enum";

interface SubscriptionPlanDto {
  id: string;
  organizationId: string | null;
  code: string;
  name: string;
  description: string | null;
  status: SubscriptionPlanStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  trialDays: number | null;
  sortOrder: number;
  isPublic: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface SubscriptionPlanRawDto extends Omit<
  SubscriptionPlanDto,
  "createdAt" | "updatedAt" | "status"
> {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
}

export interface SubscriptionPlanInputDto extends Omit<
  SubscriptionPlanDto,
  "id" | "createdAt" | "updatedAt" | "status"
> {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
}

export interface SubscriptionPlanOutputDto extends Omit<
  SubscriptionPlanDto,
  "updatedAt" | "deletedAt"
> {
  id: string;
  organizationId: string | null;
  code: string;
  name: string;
  description: string | null;
  status: SubscriptionPlanStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  trialDays: number | null;
  sortOrder: number;
  isPublic: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface SubscriptionPlanOptionalDto extends Partial<SubscriptionPlanDto> {}
