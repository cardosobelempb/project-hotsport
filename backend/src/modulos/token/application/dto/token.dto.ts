interface TokenDto {
  id: string;
  tokenId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TokenRawDto extends Omit<TokenDto, "createdAt" | "updatedAt"> {
  id: string;
  tokenId: string;
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
  tokenId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
}

export interface TokenOutputDto extends Omit<TokenDto, "updatedAt"> {
  id: string;
  tokenId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface TokenOptionalDto extends Partial<TokenDto> {}
