import { PaymentEntity } from "../../domain/entities/payment.entity";
import { PaymentOutputDto } from "../dto/payment-output.dto";

export const mapPaymentEntityToOutputDto = (
  entity: PaymentEntity,
): PaymentOutputDto => ({
  id: entity.id.toString(),
  planId: entity.planId,
  email: entity.email,
  planName: entity.planName,
  amountCents: entity.amountCents,
  status: entity.status,
  mercadoPagoId: entity.mercadoPagoId,
  createdAt: entity.createdAt.toISOString(),
  expiresAt: entity.expiresAt ? entity.expiresAt.toISOString() : null,
  updatedAt: entity.updatedAt.toISOString(),
  macAddress: entity.macAddress,
  cpf: entity.cpf,
  ipAddress: entity.ipAddress,
});
