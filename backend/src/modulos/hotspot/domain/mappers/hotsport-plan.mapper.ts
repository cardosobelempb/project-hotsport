import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import {
  HotsportPlanOutputDto,
  HotsportPlanRawDto,
} from "../../application/dto/hotsport-pan.dto";
import { HotsportPlanEntity } from "../entities/hotsport-plan-entity";

export class HotsportPlanMapper {
  static toDomain(raw: HotsportPlanRawDto): HotsportPlanEntity {
    return HotsportPlanEntity.create(
      {
        organizationId: UUIDVO.create(raw.organizationId),
        name: raw.name,
        durationSecs: raw.duratioSec,
        dataLimitMb: raw.dataLimitMb,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: HotsportPlanEntity): HotsportPlanOutputDto {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      name: entity.name,
      duratioSec: entity.durationSecs ?? 0,
      dataLimitMb: entity.dataLimitMb ?? 0,
      type: entity.type,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
