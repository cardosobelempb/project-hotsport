import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { ProviderType } from "@/common/shared/enums/provider-type.enum";
import { TokenType } from "@/common/shared/enums/token-type.enum";

export interface AccountProps {
  userId: UUIDVO;
  provider: string;
  providerAccountId: UUIDVO;
  providerType: ProviderType;
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: number | null;
  tokenType: TokenType;
  scope: string | null;
  idToken: string | null;
  sessionState: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class AccountEntity extends BaseEntity<AccountProps> {
  get userId(): UUIDVO {
    return this.props.userId;
  }

  get providerType(): ProviderType {
    return this.props.providerType;
  }

  get providerAccountId(): UUIDVO {
    return this.props.providerAccountId;
  }

  get provider(): string {
    return this.props.provider;
  }

  get refreshToken(): string | null {
    return this.props.refreshToken;
  }

  get accessToken(): string | null {
    return this.props.accessToken;
  }

  get expiresAt(): number | null {
    return this.props.expiresAt;
  }

  get tokenType(): string | null {
    return this.props.tokenType;
  }

  get scope(): string | null {
    return this.props.scope;
  }

  get idToken(): string | null {
    return this.props.idToken;
  }

  get sessionState(): string | null {
    return this.props.sessionState;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      AccountProps,
      | "accessToken"
      | "refreshToken"
      | "expiresAt"
      | "tokenType"
      | "providerType"
      | "scope"
      | "idToken"
      | "sessionState"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
    >,
    id?: UUIDVO,
  ): AccountEntity {
    return new AccountEntity(
      {
        ...props,
        accessToken: props.accessToken ?? null,
        refreshToken: props.refreshToken ?? null,
        expiresAt: props.expiresAt ?? null,
        tokenType: props.tokenType ?? TokenType.ACCESS,
        providerType: props.providerType ?? ProviderType.CREDENTIALS,
        scope: props.scope ?? null,
        idToken: props.idToken ?? null,
        sessionState: props.sessionState ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
