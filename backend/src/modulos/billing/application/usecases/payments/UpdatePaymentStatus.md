import { NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";
import { mapPayment, type PaymentOutputDto } from "./payment-output.mapper.js";

interface UpdatePaymentStatusInputDto {
  id: number;
  status: string;
}

export class UpdatePaymentStatus {
  async execute({
    id,
    status,
  }: UpdatePaymentStatusInputDto): Promise<PaymentOutputDto> {
    const exists = await prisma.payment.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Payment not found");

    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
    });
    return mapPayment(payment);
  }
}

export type { UpdatePaymentStatusInputDto };
