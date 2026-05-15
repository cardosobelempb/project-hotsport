import { prisma } from "../../lib/db.js";
import { mapPayment, type PaymentOutputDto } from "./payment-output.mapper.js";

interface ProcessPaymentInputDto {
  planId: number;
  email?: string | null;
  planName?: string | null;
  amount: number;
  status?: string | null;
  mpPaymentId?: number | null;
  expiresAt?: string | null;
  mac?: string | null;
  cpf?: string | null;
  ip?: string | null;
}

export class ProcessPayment {
  async execute(dto: ProcessPaymentInputDto): Promise<PaymentOutputDto> {
    const payment = await prisma.payment.create({
      data: {
        planId: dto.planId,
        email: dto.email ?? null,
        planName: dto.planName ?? null,
        amount: dto.amount,
        status: dto.status ?? null,
        mpPaymentId: dto.mpPaymentId ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        mac: dto.mac ?? null,
        cpf: dto.cpf ?? null,
        ip: dto.ip ?? null,
      },
    });

    return mapPayment(payment);
  }
}

export type { ProcessPaymentInputDto };
