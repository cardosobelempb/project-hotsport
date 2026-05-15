import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { VoucherStatus } from "@/common/shared/enums/voucher-status.enum";
import { VoucherEntity } from "@/modulos/hotspot/domain/entities/voucher-entity";
import {
  Prisma,
  Voucher as PrismaVoucher,
} from "../../../../../generated/prisma";

export class VoucherPrismaMapper {
  static toDomain(raw: PrismaVoucher): VoucherEntity {
    return VoucherEntity.create(
      {
        code: raw.code,
        status: raw.status as VoucherStatus,
        usedAt: raw.usedAt,
        expiredAt: raw.expiredAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
        hotspotPlanId: raw.hotspotPlanId
          ? UUIDVO.create(raw.hotspotPlanId)
          : null,
        mikrotikId: raw.mikrotikId ? UUIDVO.create(raw.mikrotikId) : null,
        organizationId: raw.organizationId
          ? UUIDVO.create(raw.organizationId)
          : null,
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
      expiredAt: entity.expiredAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  static toUpdatePersistence(
    entity: VoucherEntity,
  ): Prisma.VoucherUncheckedUpdateInput {
    return {
      code: entity.code,
      status: entity.status as VoucherStatus,
      usedAt: entity.usedAt ?? null,
      expiredAt: entity.expiredAt ?? null,
      updatedAt: entity.updatedAt,
    };
  }
}
