import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { BillingCycleDto } from "../../application/dto/plans/billing-cycle.dto";
import { SubscriptionStatusDto } from "../../application/dto/subscription/subscription-status.dto";

export interface SubscriptionProps {
  organizationId: UUIDVO;
  subscriptionPlanId: UUIDVO;
  status: SubscriptionStatusDto;
  billingCycle: BillingCycleDto;
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
    if (this.props.status === SubscriptionStatusDto.ACTIVE) return;
    this.props.status = SubscriptionStatusDto.ACTIVE;
    this.touch();
  }

  canceled() {
    if (this.props.status === SubscriptionStatusDto.CANCELED) return;
    this.props.status = SubscriptionStatusDto.CANCELED;
    this.touch();
  }

  expired() {
    if (this.props.status === SubscriptionStatusDto.EXPIRED) return;
    this.props.status = SubscriptionStatusDto.EXPIRED;
    this.touch();
  }

  pastDue() {
    if (this.props.status === SubscriptionStatusDto.PAST_DUE) return;
    this.props.status = SubscriptionStatusDto.PAST_DUE;
    this.touch();
  }

  susoended() {
    if (this.props.status === SubscriptionStatusDto.SUSPENDED) return;
    this.props.status = SubscriptionStatusDto.SUSPENDED;
    this.touch();
  }

  trialing() {
    if (this.props.status === SubscriptionStatusDto.TRIALING) return;
    this.props.status = SubscriptionStatusDto.TRIALING;
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
        status: props.status ?? SubscriptionStatusDto.ACTIVE,
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
