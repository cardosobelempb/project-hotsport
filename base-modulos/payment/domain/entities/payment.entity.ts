// ============================================================
// src/modules/subscription/domain/entities/payment.entity.ts
// ============================================================

import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { DecimalVO } from "@/common/domain/values-objects/decimal/decimal.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { PaymentStatus } from "@/common/shared/enums/payment-status.enum";

export interface PaymentProps {
  organizationId: UUIDVO;
  subscriptionId: UUIDVO | null;
  amount: DecimalVO;
  currency: string;
  status: PaymentStatus;
  provider?: string | null;
  providerTransactionId?: string | null;
  description?: string | null;
  dueAt?: Date | null;
  paidAt?: Date | null;
  failedAt?: Date | null;
  refundedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class PaymentEntity extends BaseAggregate<PaymentProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  get subscriptionId() {
    return this.props.subscriptionId;
  }
  get amount() {
    return this.props.amount;
  }
  get currency() {
    return this.props.currency;
  }
  get status() {
    return this.props.status;
  }
  get provider() {
    return this.props.provider;
  }
  get providerTransactionId() {
    return this.props.providerTransactionId;
  }
  get description() {
    return this.props.description;
  }
  get dueAt() {
    return this.props.dueAt;
  }
  get paidAt() {
    return this.props.paidAt;
  }
  get failedAt() {
    return this.props.failedAt;
  }
  get refundedAt() {
    return this.props.refundedAt;
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

  markAsPaid(paidAt: Date): void {
    if (this.status === PaymentStatus.PENDING) {
      this.props.status = PaymentStatus.PAID;
      this.props.paidAt = paidAt;
      this.touch();
    }
  }

  markAsFailed(failedAt: Date): void {
    this.props.status = PaymentStatus.FAILED;
    this.props.failedAt = failedAt;
    this.touch();
  }

  refund(refundedAt: Date): void {
    if (this.status === PaymentStatus.PAID) {
      this.props.status = PaymentStatus.REFUNDED;
      this.props.refundedAt = refundedAt;
      this.touch();
    }
  }

  isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  isPaid(): boolean {
    return this.status === PaymentStatus.PAID;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      PaymentProps,
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "paidAt"
      | "failedAt"
      | "refundedAt"
    >,
    id?: UUIDVO,
  ) {
    return new PaymentEntity(
      {
        ...props,
        currency: props.currency ?? "BRL",
        status: props.status ?? PaymentStatus.PENDING,
        paidAt: props.paidAt ?? null,
        failedAt: props.failedAt ?? null,
        refundedAt: props.refundedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
