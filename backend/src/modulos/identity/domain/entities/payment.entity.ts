import { BaseEntity } from "@/common/domain/entities/base.entity";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { PaymentStatus } from "@/common/shared/enums/payment-status.enum";

export interface PaymentProps {
  organizationId: UUIDVO;
  subscriptionId: UUIDVO | null;
  amount: number;
  status?: PaymentStatus;
  provider: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class PaymentEntity extends BaseEntity<PaymentProps> {
  get status() {
    return this.props.status ?? PaymentStatus.PENDING;
  }

  markAsPaid(): void {
    this.props.status = PaymentStatus.PAID;
    this.props.paidAt = new Date();
    this.touch();
  }
  markAsFailed(): void {
    this.props.status = PaymentStatus.FAILED;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create() {}
}
