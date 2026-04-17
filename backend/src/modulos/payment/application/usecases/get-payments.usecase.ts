import { PaymentRepository } from "../../domain/repositories/payment-repository";
import { PaymentPrismaRepository } from "../../infrastructure/repositories/prisma/payment-prisma.repository";
import { GetPaymentsInputDto } from "../dto/get-payments-input.dto";
import { PaymentOutputDto } from "../dto/payment-output.dto";
import { mapPaymentEntityToOutputDto } from "./map-payment-entity-to-output-dto";

export class GetPayments {
  constructor(
    private readonly paymentRepository: PaymentRepository = new PaymentPrismaRepository(),
  ) {}

  async execute(params: GetPaymentsInputDto = {}): Promise<PaymentOutputDto[]> {
    const result = await this.paymentRepository.search({
      page: params.page ?? 1,
      perPage: params.perPage ?? 20,
      sortBy: params.sortBy ?? "createdAt",
      sortDirection: params.sortDirection ?? "desc",
      filter: params.filter ?? "",
    });

    return result.items.map(mapPaymentEntityToOutputDto);
  }
}
