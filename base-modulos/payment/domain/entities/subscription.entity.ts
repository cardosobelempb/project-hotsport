import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { PriceVO } from "@/common/domain/values-objects/price/price.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { SubscriptionStatus } from "@/common/shared/enums/subscription-status.enum";

export interface SubscriptionProps {
  organizationId: UUIDVO;
  subscriptionPlanId: UUIDVO;
  status?: SubscriptionStatus;
  amount: PriceVO; // Decimal no Prisma → number aqui ou usar MoneyVO
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt: Date | null;
  expiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class SubscriptionEntity extends BaseAggregate<SubscriptionProps> {
  get status() {
    return this.props.status ?? SubscriptionStatus.TRIALING;
  }

  activate(): void {
    this.props.status = SubscriptionStatus.ACTIVE;
    this.touch();
  }
  cancel(): void {
    this.props.status = SubscriptionStatus.CANCELED;
    this.props.canceledAt = new Date();
    this.touch();
  }
  expire(): void {
    this.props.status = SubscriptionStatus.EXPIRED;
    this.touch();
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && !this.isDeleted();
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      SubscriptionProps,
      "createdAt" | "updatedAt" | "deletedAt" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new SubscriptionEntity(
      {
        ...props,
        status: props.status ?? SubscriptionStatus.TRIALING,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
