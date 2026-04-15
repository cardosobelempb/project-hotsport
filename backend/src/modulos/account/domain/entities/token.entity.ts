// domain/entities/token.entity.ts

import { Optional } from "@/core/domain/common/types";
import { BaseEntity } from "@/core/domain/domain/entities/base.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";

export interface TokenProps {
  id: UUIDVO;
  userId: UUIDVO;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export class TokenEntity extends BaseEntity<TokenProps> {
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

  static create(props: Optional<TokenProps, "createdAt">, id?: UUIDVO) {
    return new TokenEntity(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id,
    );
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
