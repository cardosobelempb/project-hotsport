import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Mikrotik as PrismaMikrotik } from "../../../../../../generated/prisma";

import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";
import { MikrotikDto } from "../../application/dto/mikrotik.dto";
import { MikrotikEntity } from "../../domain/entities/mikrotik-entity";

export class PrismaMikrotikMapper {
  static toDomain(raw: PrismaMikrotik): MikrotikEntity {
    return MikrotikEntity.create(
      {
        organizationId: UUIDVO.create(raw.organizationId),
        name: raw.name,
        host: raw.host,
        port: raw.port,
        username: raw.username,
        passwordHash: new PasswordVO(raw.passwordHash),
        ipAddress: raw.ipAddress,
        macAddress: raw.macAddress,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: MikrotikEntity): MikrotikDto {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.toString(),
      name: entity.name,
      host: entity.host,
      port: entity.port,
      username: entity.username,
      passwordHash: entity.passwordHash?.getValue(),
      ipAddress: entity.ipAddress,
      macAddress: entity.macAddress,
      status: entity.status,
      activeUser: entity.activeUser,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  static toPersistence(entity: MikrotikEntity): PrismaMikrotik {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.toString(),
      name: entity.name,
      host: entity.host,
      port: entity.port,
      username: entity.username,
      passwordHash: entity.passwordHash.getValue(),
      ipAddress: entity.ipAddress,
      macAddress: entity.macAddress,
      activeUser: entity.activeUser,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
