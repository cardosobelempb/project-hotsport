import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { BillingCycleDto } from "../../application/dto/plans/billing-cycle.dto";
import { SubscriptionPlanStatusDto } from "../../application/dto/subscription-plan/subscription-plan-status.dto";

export interface SubscriptionPlanProps {
  organizationId: UUIDVO;
  code: string;
  name: string;
  description: string | null;
  status: SubscriptionPlanStatusDto;
  billingCycle: BillingCycleDto;
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
    if (this.props.status === SubscriptionPlanStatusDto.ACTIVE) return;
    this.props.status = SubscriptionPlanStatusDto.ACTIVE;
    this.touch();
  }

  inactive() {
    if (this.props.status === SubscriptionPlanStatusDto.INACTIVE) return;
    this.props.status = SubscriptionPlanStatusDto.INACTIVE;
    this.touch();
  }

  archived() {
    if (this.props.status === SubscriptionPlanStatusDto.ARCHIVED) return;
    this.props.status = SubscriptionPlanStatusDto.ARCHIVED;
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

        status: props.status ?? SubscriptionPlanStatusDto.ACTIVE,
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
