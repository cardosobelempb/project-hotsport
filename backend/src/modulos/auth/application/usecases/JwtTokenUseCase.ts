import { Env } from "@/core/infrastructure/env";
import { randomUUID } from "crypto";
import { sign } from "jsonwebtoken";

type AccessTokenPayload = {
  sub: string;
  role?: string;
};

type RefreshTokenPayload = {
  sub: string;
  tokenId: string; // importante!
};

export class JwtTokenUseCase {
  constructor(private readonly config: Env) {
    this.validateConfig();
  }

  /**
   * Gera access + refresh token
   */
  async generateTokens(userId: string) {
    const accessToken = await this.generateAccessToken({
      sub: userId,
    });

    const refreshToken = await this.generateRefreshToken({
      sub: userId,
      tokenId: randomUUID(), // rastreável
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Access Token (curta duração)
   */
  private async generateAccessToken(payload: AccessTokenPayload) {
    return sign(payload, this.config.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: Number(this.config.ACCESS_TOKEN_EXPIRES_IN) || "15m",
    });
  }

  /**
   * Refresh Token (longa duração)
   */
  private async generateRefreshToken(payload: RefreshTokenPayload) {
    return sign(payload, this.config.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: Number(this.config.REFRESH_TOKEN_EXPIRES_IN) || "7d",
    });
  }

  /**
   * Validação defensiva (fail fast)
   */
  private validateConfig() {
    if (!this.config.ACCESS_TOKEN_SECRET_KEY) {
      throw new Error("ACCESS_TOKEN_SECRET_KEY não definido");
    }

    if (!this.config.REFRESH_TOKEN_SECRET_KEY) {
      throw new Error("REFRESH_TOKEN_SECRET_KEY não definido");
    }
  }
}
