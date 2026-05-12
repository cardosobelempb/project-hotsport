import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { SubscriptionPlanStatus } from "@/modulos/billing/infrastructure/http/schemas/subscription-plan-status.schema";

export interface SubscriptionPlanProps {
  organizationId: UUIDVO | null;
  code: string;
  name: string;
  amount: number;
  status?: SubscriptionPlanStatus;
  isPublic: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class SubscriptionPlanEntity extends BaseEntity<SubscriptionPlanProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get code() {
    return this.props.code;
  }

  get name() {
    return this.props.name;
  }

  get amount() {
    return this.props.amount;
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

  get status() {
    return this.props.status ?? SubscriptionPlanStatus.ACTIVE;
  }

  activate(): void {
    this.props.status = SubscriptionPlanStatus.ACTIVE;
    this.touch();
  }
  archive(): void {
    this.props.status = SubscriptionPlanStatus.ARCHIVED;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      SubscriptionPlanProps,
      "createdAt" | "updatedAt" | "deletedAt" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new SubscriptionPlanEntity(
      {
        ...props,
        status: props.status ?? SubscriptionPlanStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
