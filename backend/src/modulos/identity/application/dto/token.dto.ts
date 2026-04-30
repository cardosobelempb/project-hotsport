import { DeepPartial } from "@/common/domain/types/DeepPartial";

export interface CreateTokenDto {
  id: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateTokenDto extends DeepPartial<CreateTokenDto> {}

export interface TokenPresenterDto {
  id: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
}

export const createTokenRawExample: CreateTokenDto = {
  id: "00000000-0000-4000-8000-000000000000",
  refreshToken: "example",
  accessToken: "example",
  expiresAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: null,
};

export const tokenPresenterRawExample: TokenPresenterDto = {
  id: "00000000-0000-4000-8000-000000000000",
  refreshToken: "example",
  accessToken: "example",
  expiresAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};
