import { NotFoundError } from "@/errors";

import { PaymentEntity } from "../../domain/entities/payment.entity";
import { PaymentRepository } from "../../domain/repositories/PaymentRepository";
import { PaymentPrismaRepository } from "../../infrastructure/repositories/prisma/payment-prisma.repository";
import { PaymentOutputDto } from "../dto/payment-output.dto";
import { UpdatePaymentStatusInputDto } from "../dto/update-payment-status-input.dto";
import { mapPaymentEntityToOutputDto } from "./map-payment-entity-to-output-dto";

export class UpdatePaymentStatus {
  constructor(
    private readonly paymentRepository: PaymentRepository = new PaymentPrismaRepository(),
  ) {}

  async execute({
    id,
    status,
  }: UpdatePaymentStatusInputDto): Promise<PaymentOutputDto> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundError("Pagamento não encontrado");
    }

    const updatedPayment = PaymentEntity.create(
      {
        id: payment.id,
        planId: payment.planId,
        email: payment.email,
        planName: payment.planName,
        amountCents: payment.amountCents,
        status,
        mercadoPagoId: payment.mercadoPagoId,
        macAddress: payment.macAddress,
        cpf: payment.cpf,
        ipAddress: payment.ipAddress,
        createdAt: payment.createdAt,
        expiresAt: payment.expiresAt,
        updatedAt: new Date(),
      },
      payment.id,
    );

    const savedPayment = await this.paymentRepository.save(updatedPayment);

    return mapPaymentEntityToOutputDto(savedPayment);
  }
}
