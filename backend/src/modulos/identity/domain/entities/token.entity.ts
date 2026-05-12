import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { TokenType } from "@/common/shared/enums/token-type.enum";

export interface TokenProps {
  userId: UUIDVO;
  type: TokenType;
  valueHash: string;
  expiredAt: Date;
  revokedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class TokenEntity extends BaseEntity<TokenProps> {
  get userId() {
    return this.props.userId;
  }

  get type() {
    return this.props.type;
  }

  get valueHash() {
    return this.props.valueHash;
  }

  get expiredAt() {
    return this.props.expiredAt;
  }

  get revokedAt() {
    return this.props.revokedAt;
  }

  get ipAddress() {
    return this.props.ipAddress;
  }

  get userAgent() {
    return this.props.userAgent;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      TokenProps,
      "createdAt" | "updatedAt" | "deletedAt" | "revokedAt"
    >,
    id?: UUIDVO,
  ) {
    return new TokenEntity(
      {
        ...props,
        revokedAt: props.revokedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
