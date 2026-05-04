import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { AccountProvider } from "@/common/shared/enums/account-provider.enum";
import { AccountType } from "@/common/shared/enums/account-type.enum";

export interface AccountProps {
  userId: UUIDVO;
  providerAccountId: UUIDVO;
  provider: AccountProvider;
  passwordHash: string;
  type: AccountType;
  createdAt: Date;
  updatedAt: Date | null;
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

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get type(): string {
    return this.props.type;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  changePassword(newHash: string): void {
    this.props.passwordHash = newHash;
    this.touch();
  }

  static create(
    props: Optional<
      AccountProps,
      "createdAt" | "updatedAt" | "type" | "provider"
    >,
    id?: UUIDVO,
  ): AccountEntity {
    return new AccountEntity(
      {
        ...props,
        type: props.type ?? AccountType.PASSWORD,
        provider: props.provider ?? AccountProvider.EMAIL,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
      },
      id,
    );
  }
}
