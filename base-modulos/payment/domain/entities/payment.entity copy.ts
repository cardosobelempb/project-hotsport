import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { PaymentStatus } from "@/common/shared/enums/payment-status.enum";

export interface PaymentProps {
  status: PaymentStatus;
  organizationId: UUIDVO;
  subscriptionId: UUIDVO | null;
  amount: number;
  currency: string;
  provider: string | null;
  providerTransactionId: string | null;
  description: string | null;
  dueAt: Date | null;
  paidAt: Date | null;
  failedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class PaymentEntity extends BaseEntity<PaymentProps> {
  get status(): PaymentStatus {
    return this.props.status;
  }

  get organizationId(): UUIDVO {
    return this.props.organizationId;
  }

  get subscriptionId(): UUIDVO | null {
    return this.props.subscriptionId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get provider(): string | null {
    return this.props.provider;
  }

  get providerTransactionId(): string | null {
    return this.props.providerTransactionId;
  }

  get description(): string | null {
    return this.props.description;
  }

  get dueAt(): Date | null {
    return this.props.dueAt;
  }

  get paidAt(): Date | null {
    return this.props.paidAt;
  }

  get failedAt(): Date | null {
    return this.props.failedAt;
  }

  get refundedAt(): Date | null {
    return this.props.refundedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  /* =======================
   * Regras de negócio
   * ======================= */

  updateAmountCents(amountCents: number): void {
    if (amountCents < 0) {
      throw new Error("Preço não pode ser negativo");
    }

    this.props.amount = amountCents;
    this.touch();
  }

  /* ======================
   * Métodos internos
   * ======================= */

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  /* =======================
   * Fábricas
   * ======================= */

  static create(
    props: Optional<PaymentProps, "createdAt" | "updatedAt" | "deletedAt">,
    id?: UUIDVO,
  ) {
    const payment = new PaymentEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );

    return payment;
  }
}
