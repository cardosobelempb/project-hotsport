import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { VoucherStatus } from "@/common/shared/enums/voucher-status.enum";
import {
  VoucherDto,
  VoucherResponseDto,
} from "../../application/dto/voucher.dto";
import { VoucherEntity } from "../entities/voucher-entity";

export class VoucherMapper {
  static toDomain(raw: VoucherDto): VoucherEntity {
    return VoucherEntity.create(
      {
        code: raw.code,
        mikrotikId: UUIDVO.create(raw.mikrotikId || ""),
        organizationId: UUIDVO.create(raw.organizationId),
        planId: UUIDVO.create(raw.hotspotPlanId || ""),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: VoucherEntity): VoucherResponseDto {
    return {
      id: entity.id.getValue(),
      code: entity.code,
      status: entity.status as VoucherStatus,
      mikrotikId: entity.mikrotikId.getValue(),
      organizationId: entity.organizationId.getValue(),
      hotspotPlanId: entity.planId.getValue(),
      usedAt: entity.usedAt ? entity.usedAt.toISOString() : null,
      expiresAt: entity.expiredAt ? entity.expiredAt.toISOString() : null,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
