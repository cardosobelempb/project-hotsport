import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { ProviderType } from "@/common/shared/enums/provider-type.enum";
import { TokenType } from "@/common/shared/enums/token-type.enum";

export interface AccountProps {
  userId: UUIDVO;
  provider: ProviderType;
  providerAccountId: UUIDVO;
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
  tokenType: TokenType;
  scope: string;
  idToken: string;
  sessionState: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class AccountEntity extends BaseEntity<AccountProps> {
  get userId(): UUIDVO {
    return this.props.userId;
  }

  get providerAccountId(): UUIDVO {
    return this.props.providerAccountId;
  }

  get provider(): string {
    return this.props.provider;
  }

  get refreshToken(): string {
    return this.props.refreshToken;
  }

  get accessToken(): string {
    return this.props.accessToken;
  }

  get expiresAt(): number {
    return this.props.expiresAt;
  }

  get scope(): string {
    return this.props.scope;
  }

  get idToken(): string {
    return this.props.idToken;
  }

  get sessionState(): string {
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

  get tokenType(): TokenType {
    return this.props.tokenType as TokenType;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      AccountProps,
      | "scope"
      | "idToken"
      | "sessionState"
      | "refreshToken"
      | "accessToken"
      | "tokenType"
      | "expiresAt"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
    >,
    id?: UUIDVO,
  ): AccountEntity {
    return new AccountEntity(
      {
        ...props,
        accessToken: props.accessToken ?? "",
        refreshToken: props.refreshToken ?? "",
        sessionState: props.sessionState ?? "",
        idToken: props.idToken ?? "",
        scope: props.scope ?? "",
        tokenType: props.tokenType ?? TokenType.ACCESS,
        provider: props.provider ?? ProviderType.CREDENTIALS,
        expiresAt: props.expiresAt ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
