import { Env } from "@/common/infrastructure/env";
import { randomUUID } from "crypto";
import { sign } from "jsonwebtoken";

type AccessTokenPayload = {
  sub: string;
  role?: string;
};

type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
};

export class JwtTokenProvider {
  constructor(private readonly config: Env) {
    this.validateConfig();
  }

  async generateTokens(userId: string) {
    const accessToken = await this.generateAccessToken({ sub: userId });
    const refreshToken = await this.generateRefreshToken({
      sub: userId,
      tokenId: randomUUID(),
    });
    return { accessToken, refreshToken };
  }

  private async generateAccessToken(payload: AccessTokenPayload) {
    return sign(payload, this.config.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: Number(this.config.ACCESS_TOKEN_EXPIRES_IN) || "15m",
    });
  }

  private async generateRefreshToken(payload: RefreshTokenPayload) {
    return sign(payload, this.config.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: Number(this.config.REFRESH_TOKEN_EXPIRES_IN) || "7d",
    });
  }

  private validateConfig() {
    if (!this.config.ACCESS_TOKEN_SECRET_KEY) {
      throw new Error("ACCESS_TOKEN_SECRET_KEY não definido");
    }
    if (!this.config.REFRESH_TOKEN_SECRET_KEY) {
      throw new Error("REFRESH_TOKEN_SECRET_KEY não definido");
    }
  }
}
