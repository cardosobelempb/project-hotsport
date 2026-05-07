import {
  Prisma,
  Address as PrismaAddress,
} from "../../../../../generated/prisma";

import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { AddressType } from "@/common/shared/enums/address-type.enum";
import { AddressEntity } from "../../domain/entities/address.entity";

export class AddressPrismaMapper {
  static toDomain(raw: PrismaAddress): AddressEntity {
    return AddressEntity.create(
      {
        userId: UUIDVO.create(raw.userId),
        type: raw.type as any,
        isPrimary: raw.isPrimary,
        street: raw.street,
        number: raw.number,
        complement: raw.complement ?? null,
        neighborhood: raw.neighborhood,
        city: raw.city,
        state: raw.state,
        country: raw.country,
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
      userId: entity.userId.toString(),
      type: entity.type as AddressType,
      isPrimary: entity.isPrimary ?? false,
      street: entity.street,
      number: entity.number,
      complement: entity.complement ?? null,
      neighborhood: entity.neighborhood,
      city: entity.city,
      state: entity.state,
      country: entity.country,
      zipCode: entity.zipCode,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toUpdatePersistence(
    entity: AddressEntity,
  ): Prisma.AddressUncheckedUpdateInput {
    return {
      type: entity.type as AddressType,
      isPrimary: entity.isPrimary ?? false,
      street: entity.street,
      number: entity.number,
      complement: entity.complement ?? null,
      neighborhood: entity.neighborhood,
      city: entity.city,
      state: entity.state,
      country: entity.country,
      zipCode: entity.zipCode,
    };
  }
}
