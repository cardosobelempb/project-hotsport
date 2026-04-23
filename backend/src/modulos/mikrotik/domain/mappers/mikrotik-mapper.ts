import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import {
  MikrotikOutputDto,
  MikrotikRawDto,
} from "../../application/dto/mikrotik.dto";
import { MikrotikEntity } from "../entities/mikrotik-entity";

export class MikrotikMapper {
  static toDomain(raw: MikrotikRawDto): MikrotikEntity {
    return MikrotikEntity.create(
      {
        name: raw.name,
        host: raw.host,
        port: raw.port,
        macAddress: raw.macAddress,
        ipAddress: raw.ipAddress,
        username: raw.username,
        passwordHash: raw.passwordHash,
        organizationId: UUIDVO.create(raw.organizationId),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: MikrotikEntity): MikrotikOutputDto {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      host: entity.host,
      port: entity.port,
      macAddress: entity.macAddress,
      ipAddress: entity.ipAddress,
      username: entity.username,
      passwordHash: entity.passwordHash,
      status: entity.status,
      organizationId: entity.organizationId.getValue(),
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
