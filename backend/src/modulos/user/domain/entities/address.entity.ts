import { Optional } from "@/core/domain/common/types";
import { BaseEntity } from "@/core/domain/domain/entities/base.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { AddressType } from "../enums/address-type.enum";

export interface AddressProps {
  userId: string;
  type: AddressType;
  isPrimary: boolean;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AddressEntity extends BaseEntity<AddressProps> {
  get userId() {
    return this.props.userId;
  }
  get type() {
    return this.props.type;
  }
  get isPrimary() {
    return this.props.isPrimary;
  }
  get street() {
    return this.props.street;
  }
  get number() {
    return this.props.number;
  }
  get complement() {
    return this.props.complement;
  }
  get neighborhood() {
    return this.props.neighborhood;
  }
  get city() {
    return this.props.city;
  }
  get state() {
    return this.props.state;
  }
  get country() {
    return this.props.country;
  }
  get zipCode() {
    return this.props.zipCode;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  makePrimary(): void {
    this.props.isPrimary = true;
  }

  static create(
    props: Optional<
      AddressProps,
      "createdAt" | "updatedAt" | "isPrimary" | "country"
    >,
    id?: UUIDVO,
  ): AddressEntity {
    return new AddressEntity(
      {
        ...props,
        isPrimary: props.isPrimary ?? false,
        country: props.country ?? "BR",
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }
}
