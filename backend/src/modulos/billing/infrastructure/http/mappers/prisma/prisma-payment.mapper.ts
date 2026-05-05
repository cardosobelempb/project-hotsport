import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { PaymentStatus } from "@/common/shared/enums/payment-status.enum";
import { PaymentEntity } from "@/modulos/billing/domain/entities/payment.entity";
import {
  Prisma,
  Payment as PrismaPayment,
} from "../../../../../../../generated/prisma";

export class PrismaPaymentMapper {
  static toDomain(raw: PrismaPayment): PaymentEntity {
    return PaymentEntity.create(
      {
        status: raw.status as PaymentStatus,
        organizationId: UUIDVO.create(raw.organizationId),
        subscriptionId: raw.subscriptionId
          ? UUIDVO.create(raw.subscriptionId)
          : null,
        amount: raw.amount.toNumber(),
        currency: raw.currency,
        provider: raw.provider,
        providerTransactionId: raw.providerTransactionId,
        description: raw.description,
        dueAt: raw.dueAt,
        paidAt: raw.paidAt,
        failedAt: raw.failedAt,
        refundedAt: raw.refundedAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersistence(
    entity: PaymentEntity,
  ): Prisma.PaymentUncheckedCreateInput {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      subscriptionId: entity.subscriptionId
        ? entity.subscriptionId.getValue()
        : null,
      amount: entity.amount,
      currency: entity.currency,
      status: entity.status as PaymentStatus,
      provider: entity.provider,
      providerTransactionId: entity.providerTransactionId,
      description: entity.description,
      dueAt: entity.dueAt,
      paidAt: entity.paidAt,
      failedAt: entity.failedAt,
      refundedAt: entity.refundedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    };
  }

  static toUpdatePersistence(
    entity: PaymentEntity,
  ): Prisma.PaymentUncheckedUpdateInput {
    return {
      organizationId: entity.organizationId.getValue(),
      subscriptionId: entity.subscriptionId
        ? entity.subscriptionId.getValue()
        : null,
      amount: entity.amount,
      currency: entity.currency,
      status: entity.status as PaymentStatus,
      provider: entity.provider,
      providerTransactionId: entity.providerTransactionId,
      description: entity.description,
      dueAt: entity.dueAt,
      paidAt: entity.paidAt,
      failedAt: entity.failedAt,
      refundedAt: entity.refundedAt,
      createdAt: entity.createdAt,
      updatedAt: new Date(),
      deletedAt: entity.deletedAt ?? null,
    };
  }
}
