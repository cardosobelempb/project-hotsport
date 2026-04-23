import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import {
  HotsportUserOutputDto,
  HotsportUserRawDto,
} from "../../application/dto/hotsport-user.dto";
import { HotsportUserEntity } from "../entities/hotsport-user-entity";

export class HotsportUserMapper {
  static toDomain(raw: HotsportUserRawDto): HotsportUserEntity {
    return HotsportUserEntity.create(
      {
        organizationId: UUIDVO.create(raw.hotsportuserId),
        mikrotikId: UUIDVO.create(raw.mikrotikId),
        username: raw.username,
        passwordHash: raw.passwordHash,
        macAddress: raw.macAddress,
        ipAddress: raw.ipAddress,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: HotsportUserEntity): HotsportUserOutputDto {
    return {
      id: entity.id.getValue(),
      hotsportuserId: entity.organizationId.getValue(),
      mikrotikId: entity.mikrotikId.getValue(),
      username: entity.username,
      passwordHash: entity.passwordHash,
      macAddress: entity.macAddress,
      ipAddress: entity.ipAddress,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
