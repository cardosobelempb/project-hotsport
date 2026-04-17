import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import {
  VoucherOutputDto,
  VoucherRawDto,
} from "../../application/dto/voucher.dto";
import { VoucherEntity } from "../entities/voucher-entity";

export class VoucherMapper {
  static toDomain(raw: VoucherRawDto): VoucherEntity {
    return VoucherEntity.create(
      {
        code: raw.code,
        mikrotikId: UUIDVO.create(raw.mikrotikId),
        organizationId: UUIDVO.create(raw.organizationId),
        planId: UUIDVO.create(raw.planId),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: VoucherEntity): VoucherOutputDto {
    return {
      id: entity.id.getValue(),
      code: entity.code,
      status: entity.status,
      mikrotikId: entity.mikrotikId.getValue(),
      organizationId: entity.organizationId.getValue(),
      planId: entity.planId.getValue(),
      usedAt: entity.usedAt ? entity.usedAt.toISOString() : null,
      expiresAt: entity.expiresAt ? entity.expiresAt.toISOString() : null,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
