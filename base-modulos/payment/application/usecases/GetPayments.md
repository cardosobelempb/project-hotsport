import { prisma } from "../../lib/db.js";
import { mapPayment, type PaymentOutputDto } from "./payment-output.mapper.js";

export class GetPayments {
  async execute(): Promise<PaymentOutputDto[]> {
    const payments = await prisma.payment.findMany({ orderBy: { id: "desc" } });
    return payments.map(mapPayment);
  }
}
