import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { AddressType } from "@/common/shared/enums/address-type.enum";

export interface AddressProps {
  userId: UUIDVO | null;
  tenantId: UUIDVO | null;
  organizationId: UUIDVO | null;
  memberId: UUIDVO | null;
  addressType: AddressType;
  street: string | null;
  addressNumber: string | null;
  complement: string | null;
  neighborhood: string | null;
  cityId: UUIDVO | null;
  stateId: UUIDVO | null;
  zipCode: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class AddressEntity extends BaseEntity<AddressProps> {
  get isPrimary() {
    return this.props.isPrimary ?? false;
  }

  markAsPrimary(): void {
    this.props.isPrimary = true;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<AddressProps, "createdAt" | "updatedAt" | "deletedAt">,
    id?: UUIDVO,
  ) {
    return new AddressEntity(
      {
        ...props,
        isPrimary: props.isPrimary ?? false,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
