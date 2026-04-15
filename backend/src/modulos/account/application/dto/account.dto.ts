export interface AccountDto {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AccountInputDto extends Omit<
  AccountDto,
  "id" | "createdAt" | "updatedAt"
> {
  userId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
}

export interface AccountOutputDto extends Omit<AccountDto, "updatedAt"> {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
  createdAt: string;
}

export interface AccountOptionalDto extends Partial<AccountDto> {}
