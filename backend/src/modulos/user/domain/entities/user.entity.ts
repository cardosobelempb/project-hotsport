// domain/entities/user.entity.ts
import { EntityDomain, UUIDVO } from "@/core";
import { Optional } from "@/core/core/common";

import { UserProps } from "./user.props";

export class UserEntity extends EntityDomain<UserProps> {
  /* =======================
   * Getters
   * ======================= */

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get status(): string {
    return this.props.status;
  }

  get cpf(): string {
    return this.props.cpf;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  /* ======================
   * Métodos internos
   * ======================= */

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  /* =======================
   * Fábricas
   * ======================= */

  static create(
    props: Optional<UserProps, "createdAt" | "updatedAt" | "status">,
    id?: UUIDVO,
  ) {
    const user = new UserEntity(
      {
        ...props,
        status: props.status ?? "active",
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return user;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      cpf: this.cpf,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
