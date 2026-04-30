import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import {
  Prisma,
  Mikrotik as PrismaMikrotik,
} from "../../../../../generated/prisma";

import { CreatMikrotikOutputDto } from "../../application/dto/create-mikrotik.output";
import { MikrotikEntity } from "../../domain/entities/mikrotik-entity";

export class MikrotikMapper {
  // 🔁 Prisma → Domain
  static toDomain(raw: PrismaMikrotik): MikrotikEntity {
    return MikrotikEntity.create(
      {
        name: raw.name,
        host: raw.host,
        port: raw.port,
        username: raw.username,
        passwordHash: raw.passwordHash,
        ipAddress: raw.ipAddress,
        macAddress: raw.macAddress,
        organizationId: UUIDVO.create(raw.organizationId),
      },
      UUIDVO.create(raw.id),
    );
  }

  // 🔁 Domain → Prisma
  static toPersistence(
    entity: MikrotikEntity,
  ): Prisma.MikrotikUncheckedCreateInput {
    return {
      name: entity.name,
      host: entity.host,
      port: entity.port,
      username: entity.username,
      passwordHash: entity.passwordHash,
      ipAddress: entity.ipAddress,
      macAddress: entity.macAddress,
      organizationId: entity.organizationId.toString(),
    };
  }

  static toOutput(entity: MikrotikEntity): CreatMikrotikOutputDto {
    return {
      id: entity.id.toString(),
      name: entity.name,
      host: entity.host,
      port: entity.port,
      username: entity.username,
      ipAddress: entity.ipAddress,
      macAddress: entity.macAddress,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      organizationId: entity.organizationId.toString(),
    };
  }
}
