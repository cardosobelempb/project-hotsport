import { DeepPartial } from "@/common/domain/types/DeepPartial";

export interface CreateAccountDto {
  id: string;
  accountId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateAccountDto extends DeepPartial<CreateAccountDto> {}

export interface AccountPresenterDto {
  id: string;
  accountId: string;
  provider: string;
  providerAccountId: string;
  passwordHash: string;
  createdAt: string;
}

export const createAccountRawExample: CreateAccountDto = {
  id: "00000000-0000-4000-8000-000000000000",
  accountId: "00000000-0000-4000-8000-000000000000",
  providerAccountId: "00000000-0000-4000-8000-000000000000",
  provider: "example",
  createdAt: new Date().toISOString(),
  passwordHash: "example",
  updatedAt: null,
};

export const accountPresenterRawExample: AccountPresenterDto = {
  id: "00000000-0000-4000-8000-000000000000",
  accountId: "00000000-0000-4000-8000-000000000000",
  providerAccountId: "00000000-0000-4000-8000-000000000000",
  provider: "example",
  createdAt: new Date().toISOString(),
  passwordHash: "example",
};
