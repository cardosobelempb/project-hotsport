import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { BillingCycle } from "../enums/biling-cycle.enum";
import { SubscriptionStatus } from "../enums/subscription-status.enum";

export interface SubscriptionProps {
  organizationId: UUIDVO;
  subscriptionPlanId: UUIDVO;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: Number;
  currency: string;
  trialStartsAt: Date | null;
  trialEndsAt: Date | null;
  startsAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class SubscriptionEntity extends BaseAggregate<SubscriptionProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get subscriptionPlanId() {
    return this.props.subscriptionPlanId;
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

  get trialStartsAt() {
    return this.props.trialStartsAt;
  }

  get trialEndsAt() {
    return this.props.trialEndsAt;
  }

  get startsAt() {
    return this.props.startsAt;
  }

  get currentPeriodStart() {
    return this.props.currentPeriodStart;
  }

  get currentPeriodEnd() {
    return this.props.currentPeriodEnd;
  }

  get canceledAt() {
    return this.props.canceledAt;
  }

  get expiresAt() {
    return this.props.expiresAt;
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

  get deletedAt() {
    return this.props.deletedAt;
  }

  activate() {
    if (this.props.status === SubscriptionStatus.ACTIVE) return;
    this.props.status = SubscriptionStatus.ACTIVE;
    this.touch();
  }

  canceled() {
    if (this.props.status === SubscriptionStatus.CANCELED) return;
    this.props.status = SubscriptionStatus.CANCELED;
    this.touch();
  }

  expired() {
    if (this.props.status === SubscriptionStatus.EXPIRED) return;
    this.props.status = SubscriptionStatus.EXPIRED;
    this.touch();
  }

  pastDue() {
    if (this.props.status === SubscriptionStatus.PAST_DUE) return;
    this.props.status = SubscriptionStatus.PAST_DUE;
    this.touch();
  }

  susoended() {
    if (this.props.status === SubscriptionStatus.SUSPENDED) return;
    this.props.status = SubscriptionStatus.SUSPENDED;
    this.touch();
  }

  trialing() {
    if (this.props.status === SubscriptionStatus.TRIALING) return;
    this.props.status = SubscriptionStatus.TRIALING;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      SubscriptionProps,
      | "status"
      | "trialStartsAt"
      | "trialEndsAt"
      | "canceledAt"
      | "expiresAt"
      | "deletedAt"
      | "createdAt"
      | "updatedAt"
    >,
    id?: UUIDVO,
  ) {
    return new SubscriptionEntity(
      {
        ...props,
        status: props.status ?? SubscriptionStatus.ACTIVE,
        trialStartsAt: props.trialStartsAt ?? null,
        trialEndsAt: props.trialEndsAt ?? null,
        canceledAt: props.canceledAt ?? null,
        expiresAt: props.expiresAt ?? null,
        deletedAt: props.deletedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
