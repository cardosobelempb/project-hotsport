// domain/entities/token.entity.ts
import { EntityDomain, UUIDVO } from "@/core";
import { Optional } from "@/core/core/common";

import { TokenProps } from "./token.props";

export class TokenEntity extends EntityDomain<TokenProps> {
  /* =======================
   * Getters
   * ======================= */

  get userId(): UUIDVO {
    return this.props.userId;
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get refreshToken(): string {
    return this.props.refreshToken;
  }

  get expiresAt(): string | null {
    return this.props.expiresAt.toISOString();
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /* =======================
   * Fábricas
   * ======================= */

  static create(props: Optional<TokenProps, "createdAt">, id?: UUIDVO) {
    const token = new TokenEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return token;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
