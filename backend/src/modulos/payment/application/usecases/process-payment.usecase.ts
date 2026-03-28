import { UUIDVO } from "@/common";

import { PaymentEntity } from "../../domain/entities/payment.entity";
import { PaymentRepository } from "../../domain/repositories/PaymentRepository";
import { PaymentPrismaRepository } from "../../infrastructure/repositories/prisma/payment-prisma.repository";
import { PaymentOutputDto } from "../dto/payment-output.dto";
import { ProcessPaymentInputDto } from "../dto/process-payment-input.dto";
import { mapPaymentEntityToOutputDto } from "./map-payment-entity-to-output-dto";

export class ProcessPayment {
  constructor(
    private readonly paymentRepository: PaymentRepository = new PaymentPrismaRepository(),
  ) {}

  async execute(dto: ProcessPaymentInputDto): Promise<PaymentOutputDto> {
    const paymentId = UUIDVO.create();
    const payment = PaymentEntity.create(
      {
        id: paymentId,
        planId: dto.planId,
        email: dto.email ?? null,
        planName: dto.planName ?? null,
        amountCents: dto.amountCents,
        status: dto.status ?? null,
        mercadoPagoId: dto.mercadoPagoId ?? null,
        macAddress: dto.macAddress ?? null,
        cpf: dto.cpf ?? null,
        ipAddress: dto.ipAddress ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      paymentId,
    );

    const savedPayment = await this.paymentRepository.save(payment);

    return mapPaymentEntityToOutputDto(savedPayment);
  }
}
