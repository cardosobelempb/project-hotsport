import { Optional } from "@/core/domain/common/types";
import { BaseEntity } from "@/core/domain/domain/entities/base.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";

export interface TokenProps {
  tokenId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date | null;
}

export class TokenEntity extends BaseEntity<TokenProps> {
  get tokenId() {
    return this.props.tokenId;
  }

  get refreshToken() {
    return this.props.refreshToken;
  }

  get accessToken() {
    return this.props.accessToken;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get isExpired() {
    return this.expiresAt < new Date();
  }

  get isValid() {
    return !this.isExpired;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<TokenProps, "createdAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    return new TokenEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
