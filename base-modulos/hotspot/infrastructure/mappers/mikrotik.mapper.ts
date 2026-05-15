import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { Mikrotik as PrismaMikrotik } from "../../../../../generated/prisma";

import { IpAddressVO } from "@/common/domain/values-objects/ip-address/ip-address.vo";
import { MacAddressVO } from "@/common/domain/values-objects/mac-address/mac-address.vo";
import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";
import { MikrotikStatus } from "@/common/shared/enums/mikrotik-status.enum";
import { MikrotikDto } from "../../application/dto/mikrotik.dto";
import { MikrotikEntity } from "../../domain/entities/mikrotik-entity";

export class PrismaMikrotikMapper {
  static toDomain(raw: PrismaMikrotik): MikrotikEntity {
    return MikrotikEntity.create(
      {
        username: raw.username,
        passwordHash: new PasswordVO(raw.passwordHash),
        host: IpAddressVO.create(raw.host),
        name: raw.name,
        port: raw.port,
        macAddress: MacAddressVO.create(raw.macAddress),
        ipAddress: IpAddressVO.create(raw.ipAddress),
        activeUser: raw.activeUser,
        status: raw.status as MikrotikStatus,
        organizationId: UUIDVO.create(raw.organizationId),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toDTO(entity: MikrotikEntity): MikrotikDto {
    return {
      id: entity.id.toString(),
      organizationId: entity.organizationId.toString(),
      name: entity.name,
      host: entity.host.getValue(),
      port: entity.port,
      macAddress: entity.macAddress.getValue(),
      ipAddress: entity.ipAddress.getValue(),
      username: entity.username,
      passwordHash: entity.passwordHash?.getValue(),
      activeUser: entity.activeUser,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  static toPrisma(entity: MikrotikEntity): PrismaMikrotik {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      name: entity.name,
      host: entity.host.getValue(),
      port: entity.port,
      macAddress: entity.macAddress.getValue(),
      ipAddress: entity.ipAddress.getValue(),
      username: entity.username,
      passwordHash: entity.passwordHash?.getValue(),
      activeUser: entity.activeUser,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
