import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { ProviderType } from "@/common/shared/enums/provider-type.enum";
import { TokenType } from "@/common/shared/enums/token-type.enum";

export interface AccountProps {
  userId: UUIDVO;
  tokenType: TokenType;
  provider: ProviderType;
  providerAccountId: UUIDVO;
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
  scope: string;
  idToken: string;
  sessionState: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class AccountEntity extends BaseEntity<AccountProps> {
  get userId() {
    return this.props.userId;
  }
  get provider() {
    return this.props.provider;
  }
  get providerAccountId() {
    return this.props.providerAccountId;
  }
  get expiresAt() {
    return this.props.expiresAt;
  }

  get refreshToken() {
    return this.props.refreshToken;
  }

  get accessToken() {
    return this.props.accessToken;
  }

  get tokenType() {
    return this.props.tokenType;
  }

  get scope() {
    return this.props.scope;
  }

  get idToken() {
    return this.props.idToken;
  }

  get sessionState() {
    return this.props.sessionState;
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

  isExpired(): boolean {
    return this.props.expiresAt ? Date.now() > this.props.expiresAt : false;
  }

  revoke(): void {
    this.props.expiresAt = Date.now();
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<AccountProps, "createdAt" | "updatedAt" | "deletedAt">,
    id?: UUIDVO,
  ): AccountEntity {
    return new AccountEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
