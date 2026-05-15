import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { AddressType } from "@/common/shared/enums/address-type.enum";

export interface AddressProps {
  userId: UUIDVO | null;
  tenantId: UUIDVO | null;
  memberId: UUIDVO | null;
  organizationId: UUIDVO | null;
  street: string | null;
  addressType: AddressType;
  addressNumber: string | null;
  complement: string | null;
  neighborhood: string | null;
  cityId: UUIDVO | null;
  stateId: UUIDVO | null;
  // countryId: UUIDVO | null;
  country: string | null;
  zipCode: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class AddressEntity extends BaseEntity<AddressProps> {
  get userId() {
    return this.props.userId;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get organizationId() {
    return this.props.organizationId;
  }
  get memberId() {
    return this.props.memberId;
  }
  get addressType() {
    return this.props.addressType;
  }
  get street() {
    return this.props.street;
  }
  get addressNumber() {
    return this.props.addressNumber;
  }
  get complement() {
    return this.props.complement;
  }
  get neighborhood() {
    return this.props.neighborhood;
  }
  get cityId() {
    return this.props.cityId;
  }
  get stateId() {
    return this.props.stateId;
  }

  get country() {
    return this.props.country;
  }
  get zipCode() {
    return this.props.zipCode;
  }
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
