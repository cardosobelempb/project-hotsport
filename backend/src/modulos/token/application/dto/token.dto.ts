interface TokenDto {
  id: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TokenRawDto extends Omit<TokenDto, "createdAt" | "updatedAt"> {
  id: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TokenInputDto extends Omit<
  TokenDto,
  "id" | "createdAt" | "updatedAt"
> {
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
}

export interface TokenOutputDto extends Omit<TokenDto, "updatedAt"> {
  id: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface TokenOptionalDto extends Partial<TokenDto> {}
