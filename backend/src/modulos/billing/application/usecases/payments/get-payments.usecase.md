import { PaymentRepository } from "@/modulos/billing/domain/repositories/payment-repository";
import { GetPaymentsInputDto } from "../../dto/payments/get-payments-input.dto";
import { PaymentOutputDto } from "../../dto/payments/payment-output.dto";

import { PrismaPaymentRepository } from "@/modulos/billing/infrastructure/http/repositories/prisma/prisma-payment.repository";
import { mapPaymentEntityToOutputDto } from "./map-payment-entity-to-output-dto";

export class GetPayments {
  constructor(
    private readonly paymentRepository: PaymentRepository = new PrismaPaymentRepository(),
  ) {}

  async execute(params: GetPaymentsInputDto = {}): Promise<PaymentOutputDto[]> {
    const result = await this.paymentRepository.page({
      page: params.page ?? 1,
      perPage: params.perPage ?? 20,
      sortBy: params.sortBy ?? "createdAt",
      sortDirection: params.sortDirection ?? "desc",
      filter: params.filter ?? "",
    });

    return result.items.map(mapPaymentEntityToOutputDto);
  }
}
