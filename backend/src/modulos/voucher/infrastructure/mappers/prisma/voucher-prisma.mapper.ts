import {
  Prisma,
  Voucher as PrismaVoucher,
  VoucherStatus as PrismaVoucherStatus,
} from "../../../../../../generated/prisma";

import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { VoucherStatus } from "@/modulos/voucher/domain/emuns/voucher-status.enum";
import { VoucherEntity } from "@/modulos/voucher/domain/entities/voucher-entity";

export class VoucherPrismaMapper {
  static toDomain(raw: PrismaVoucher): VoucherEntity {
    return VoucherEntity.create(
      {
        code: raw.code,
        status: raw.status as VoucherStatus,
        usedAt: raw.usedAt,
        expiresAt: raw.expiresAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        mikrotikId: UUIDVO.create(raw.mikrotikId),
        organizationId: UUIDVO.create(raw.organizationId),
        planId: UUIDVO.create(raw.planId),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersistence(
    entity: VoucherEntity,
  ): Prisma.VoucherUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      code: entity.code,
      status: entity.status as VoucherStatus,
      usedAt: entity.usedAt ?? null,
      expiresAt: entity.expiresAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      mikrotikId: entity.mikrotikId.toString(),
      organizationId: entity.organizationId.toString(),
      planId: entity.planId.toString(),
    };
  }

  static toUpdatePersistence(
    entity: VoucherEntity,
  ): Prisma.VoucherUncheckedUpdateInput {
    return {
      code: entity.code,
      status: entity.status as PrismaVoucherStatus,
      usedAt: entity.usedAt ?? null,
      expiresAt: entity.expiresAt ?? null,
      updatedAt: entity.updatedAt,
    };
  }
}
