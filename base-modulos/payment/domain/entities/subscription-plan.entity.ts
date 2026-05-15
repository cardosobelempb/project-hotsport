// ============================================================
// src/modules/subscription/domain/entities/subscription-plan.entity.ts
// ============================================================

import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { DecimalVO } from "@/common/domain/values-objects/decimal/decimal.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { BillingCycle } from "@/common/shared/enums/billing-cycle.enum";
import { PlanStatus } from "@/common/shared/enums/plan-status.enum";

export interface SubscriptionPlanProps {
  organizationId: UUIDVO | null;
  code: string;
  name: string;
  description?: string | null;
  status: PlanStatus;
  billingCycle: BillingCycle;
  amount: DecimalVO;
  currency: string;
  trialDays?: number | null;
  sortOrder: number;
  isPublic: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class SubscriptionPlanEntity extends BaseAggregate<SubscriptionPlanProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  get code() {
    return this.props.code;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get status() {
    return this.props.status;
  }
  get billingCycle() {
    return this.props.billingCycle;
  }
  get amount() {
    return this.props.amount;
  }
  get currency() {
    return this.props.currency;
  }
  get trialDays() {
    return this.props.trialDays;
  }
  get sortOrder() {
    return this.props.sortOrder;
  }
  get isPublic() {
    return this.props.isPublic;
  }
  get isDefault() {
    return this.props.isDefault;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }

  publish(): void {
    this.props.status = PlanStatus.ACTIVE;
    this.props.isPublic = true;
    this.touch();
  }

  unpublish(): void {
    this.props.status = PlanStatus.INACTIVE;
    this.touch();
  }

  setDefault(): void {
    this.props.isDefault = true;
    this.touch();
  }

  softDelete(): void {
    if (!this.isDeleted()) {
      this.props.deletedAt = new Date();
      this.touch();
    }
  }

  isPublished(): boolean {
    return (
      this.status === PlanStatus.ACTIVE && this.isPublic && !this.isDeleted()
    );
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  updatePrice(amount: DecimalVO): void {
    this.props.amount = amount;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      SubscriptionPlanProps,
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "sortOrder"
      | "isPublic"
      | "isDefault"
    >,
    id?: UUIDVO,
  ) {
    return new SubscriptionPlanEntity(
      {
        ...props,
        sortOrder: props.sortOrder ?? 0,
        isPublic: props.isPublic ?? true,
        isDefault: props.isDefault ?? false,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
