import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { BillingCycle } from "@/modulos/subscription/domain/enums/biling-cycle.enum";
import { SubscriptionPlanStatus } from "../enums/subscription-plan-status.enum";

export interface SubscriptionPlanProps {
  organizationId: UUIDVO;
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

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  activate() {
    if (this.props.status === SubscriptionPlanStatus.ACTIVE) return;
    this.props.status = SubscriptionPlanStatus.ACTIVE;
    this.touch();
  }

  inactive() {
    if (this.props.status === SubscriptionPlanStatus.INACTIVE) return;
    this.props.status = SubscriptionPlanStatus.INACTIVE;
    this.touch();
  }

  archived() {
    if (this.props.status === SubscriptionPlanStatus.ARCHIVED) return;
    this.props.status = SubscriptionPlanStatus.ARCHIVED;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      SubscriptionPlanProps,
      | "status"
      | "createdAt"
      | "updatedAt"
      | "description"
      | "trialDays"
      | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
    return new SubscriptionPlanEntity(
      {
        ...props,

        status: props.status ?? SubscriptionPlanStatus.ACTIVE,
        description: props.description ?? null,
        trialDays: props.trialDays ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
