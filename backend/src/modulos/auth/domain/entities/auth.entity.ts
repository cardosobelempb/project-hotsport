// domain/entities/credential.entity.ts
import { EntityDomain, UUIDVO } from "@/core";

import { Optional } from "@/core/core/common";
import { AuthProps } from "./auth.props";

export class AuthEntity extends EntityDomain<AuthProps> {
  /* =======================
   * Getters
   * ======================= */

  get userId(): string {
    return this.props.userId.toString();
  }

  get email(): string {
    return this.props.email.getValue();
  }

  get passwordHash(): string | null {
    return this.props.passwordHash;
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
    props: Optional<AuthProps, "createdAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    const auth = new AuthEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    return auth;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      userId: this.userId,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
