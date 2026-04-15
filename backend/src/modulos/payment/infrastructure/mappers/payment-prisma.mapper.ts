import { UUIDVO } from "@/common";
import { type Payment, Prisma } from "@/generated/prisma";

import { PaymentEntity } from "../../domain/entities/payment.entity";

export class PaymentPrismaMapper {
  static toDomain(raw: Payment): PaymentEntity {
    const paymentId = UUIDVO.create(raw.id);

    return PaymentEntity.create(
      {
        id: paymentId,
        planId: raw.planId,
        email: raw.email,
        planName: raw.planName,
        amountCents: raw.amountCents,
        status: raw.status,
        mercadoPagoId: raw.mercadoPagoId,
        macAddress: raw.macAddress,
        cpf: raw.cpf,
        ipAddress: raw.ipAddress,
        createdAt: raw.createdAt,
        expiresAt: raw.expiresAt,
        updatedAt: raw.updatedAt,
      },
      paymentId,
    );
  }

  static toPrisma(entity: PaymentEntity): Prisma.PaymentUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      planId: entity.planId,
      email: entity.email,
      planName: entity.planName,
      amountCents: entity.amountCents,
      status: entity.status,
      mercadoPagoId: entity.mercadoPagoId,
      macAddress: entity.macAddress,
      cpf: entity.cpf,
      ipAddress: entity.ipAddress,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      updatedAt: entity.updatedAt,
    };
  }
}
