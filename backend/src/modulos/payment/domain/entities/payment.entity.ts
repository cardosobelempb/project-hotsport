// domain/entities/payment.entity.ts
import { EntityDomain, UUIDVO } from "@/common";
import { Optional } from "@/common/domain/common";

import { PaymentProps } from "./payment.props";

export class PaymentEntity extends EntityDomain<PaymentProps> {
  /* =======================
   * Getters
   * ======================= */

  get id(): UUIDVO {
    return this.props.id;
  }

  get planId(): string {
    return this.props.planId;
  }

  get amountCents(): number {
    return this.props.amountCents;
  }

  get email(): string | null {
    return this.props.email;
  }

  get planName(): string | null {
    return this.props.planName;
  }

  get status(): string | null {
    return this.props.status;
  }

  get mercadoPagoId(): string | null {
    return this.props.mercadoPagoId;
  }

  get macAddress(): string | null {
    return this.props.macAddress;
  }

  get cpf(): string | null {
    return this.props.cpf;
  }

  get ipAddress(): string | null {
    return this.props.ipAddress;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /* =======================
   * Regras de negócio
   * ======================= */

  updateAmountCents(amountCents: number): void {
    if (amountCents < 0) {
      throw new Error("Preço não pode ser negativo");
    }

    this.props.amountCents = amountCents;
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
    props: Optional<PaymentProps, "createdAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    const payment = new PaymentEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return payment;
  }
}
