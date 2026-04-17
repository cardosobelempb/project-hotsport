import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { AddressType } from "../enums/address-type.enum";

export interface AddressProps {
  userId: UUIDVO;
  type: AddressType;
  isPrimary: boolean;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export class AddressEntity extends BaseAggregate<AddressProps> {
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

  get fullAddress() {
    return `${this.street}, ${this.number}${
      this.complement ? `, ${this.complement}` : ""
    }, ${this.neighborhood}, ${this.city} - ${this.state}, ${this.country}, CEP: ${this.zipCode}`;
  }

  setAsPrimary() {
    if (this.props.isPrimary) return;
    this.props.isPrimary = true;
    this.touch();
  }

  unsetPrimary() {
    if (!this.props.isPrimary) return;
    this.props.isPrimary = false;
    this.touch();
  }

  updateAddress(params: {
    type?: AddressType;
    street?: string;
    number?: string;
    complement?: string | null;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }) {
    if (params.type !== undefined) this.props.type = params.type;
    if (params.street !== undefined) this.props.street = params.street;
    if (params.number !== undefined) this.props.number = params.number;
    if (params.complement !== undefined)
      this.props.complement = params.complement;
    if (params.neighborhood !== undefined)
      this.props.neighborhood = params.neighborhood;
    if (params.city !== undefined) this.props.city = params.city;
    if (params.state !== undefined) this.props.state = params.state;
    if (params.country !== undefined) this.props.country = params.country;
    if (params.zipCode !== undefined) this.props.zipCode = params.zipCode;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      AddressProps,
      | "type"
      | "isPrimary"
      | "complement"
      | "country"
      | "createdAt"
      | "updatedAt"
    >,
    id?: UUIDVO,
  ) {
    return new AddressEntity(
      {
        ...props,
        type: props.type ?? AddressType.HOME,
        isPrimary: props.isPrimary ?? false,
        complement: props.complement ?? null,
        country: props.country ?? "BR",
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
