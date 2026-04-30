interface AccountDto {
  id: string;
  accountId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AccountRawDto extends Omit<
  AccountDto,
  "createdAt" | "updatedAt"
> {
  id: string;
  accountId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
}

export interface AccountInputDto extends Omit<
  AccountDto,
  "id" | "createdAt" | "updatedAt"
> {
  accountId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
}

export interface AccountOutputDto extends Omit<AccountDto, "updatedAt"> {
  id: string;
  accountId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
  createdAt: string;
}

export interface AccountOptionalDto extends Partial<AccountDto> {}
