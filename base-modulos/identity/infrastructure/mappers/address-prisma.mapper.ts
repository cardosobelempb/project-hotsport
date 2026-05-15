import {
  Prisma,
  Address as PrismaAddress,
} from "../../../../../generated/prisma";

import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { AddressType } from "@/common/shared/enums/address-type.enum";
import { AddressEntity } from "../../../tenant/domain/entities/address.entity";

export class AddressPrismaMapper {
  static toDomain(raw: PrismaAddress): AddressEntity {
    return AddressEntity.create(
      {
        userId: raw.userId ? UUIDVO.create(raw.userId) : null,
        tenantId: raw.tenantId ? UUIDVO.create(raw.tenantId) : null,
        organizationId: raw.organizationId
          ? UUIDVO.create(raw.organizationId)
          : null,
        memberId: raw.memberId ? UUIDVO.create(raw.memberId) : null,
        addressType: raw.addressNumber as AddressType,
        street: raw.street,
        country: raw.country,
        complement: raw.complement ?? null,
        neighborhood: raw.neighborhood,
        addressNumber: raw.addressNumber,
        cityId: raw.cityId ? UUIDVO.create(raw.cityId) : null,
        stateId: raw.stateId ? UUIDVO.create(raw.stateId) : null,
        isPrimary: raw.isPrimary ?? false,
        zipCode: raw.zipCode,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toPersistence(
    entity: AddressEntity,
  ): Prisma.AddressUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      userId: entity.userId?.toString() ?? null,
      AddressType: entity.addressType as AddressType,
      isPrimary: entity.isPrimary ?? false,
      street: entity.street,
      addressNumber: entity.addressNumber,
      complement: entity.complement ?? null,
      neighborhood: entity.neighborhood,
      cityId: entity.cityId?.toString() ?? null,
      stateId: entity.stateId?.toString() ?? null,
      zipCode: entity.zipCode,
    };
  }

  static toUpdatePersistence(
    entity: AddressEntity,
  ): Prisma.AddressUncheckedUpdateInput {
    return {
      addressNumber: entity.addressNumber,
      complement: entity.complement ?? null,
      neighborhood: entity.neighborhood,
      country: entity.country,
      cityId: entity.cityId?.toString() ?? null,
      stateId: entity.stateId?.toString() ?? null,
      zipCode: entity.zipCode,
    };
  }
}
