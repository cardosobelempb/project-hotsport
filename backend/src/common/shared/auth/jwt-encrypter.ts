// shared/auth/jwt-encrypter.ts

import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { env } from "@/common/infrastructure/env";
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";
import { BaseEncrypter } from "./base-encrypter";
import { JwtPayload } from "./types/jwt.types";
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  SessionTokenPayload,
} from "./types/token.types";

/**
 * Implementação JWT completa:
 * - encrypt (sign)
 * - decrypt (verify)
 */
export class JwtEncrypter implements BaseEncrypter<JwtPayload> {
  /**
   * Gera um token JWT
   */
  async encryptAccessToken(payload: AccessTokenPayload): Promise<string> {
    this.validateConfig();

    return sign(payload, env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: `${env.JWT_ACCESS_TOKEN_EXPIRES_IN}m`, // Expires in 15 minutes
    });
  }

  async encryptSessionToken(payload: SessionTokenPayload): Promise<string> {
    this.validateConfig();

    return sign(payload, env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: `${env.JWT_ACCESS_TOKEN_EXPIRES_IN}m`, // Expires in 15 minutes
    });
  }

  async encryptRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    this.validateConfig();

    return sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: `${env.JWT_REFRESH_TOKEN_EXPIRES_IN}d`, // Expires in 15 minutes
    });
  }

  /**
   * Valida e decodifica o token
   */
  async decrypt(token: string): Promise<JwtPayload> {
    this.validateConfig();

    try {
      const decoded = verify(token, env.JWT_ACCESS_TOKEN_SECRET);

      if (typeof decoded === "string") {
        throw new BadRequestError({
          message: "Token inválido",
          fieldName: "token",
        });
      }

      return decoded as JwtPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BadRequestError({
          message: "Token expirado",
          fieldName: "token",
        });
      }

      if (error instanceof JsonWebTokenError) {
        throw new BadRequestError({
          message: "Token inválido",
          fieldName: "token",
        });
      }

      throw error;
    }
  }

  /**
   * Valida configuração
   */
  verifyAccessToken(token: string) {
    const accessTolen = verify(token, env.JWT_ACCESS_TOKEN_SECRET);
    if (!accessTolen) {
      throw new BadRequestError({
        message: "Token inválido",
        fieldName: "token",
      });
    }
    return accessTolen;
  }

  verifyRefreshToken(token: string) {
    const refreshToken = verify(token, env.JWT_REFRESH_SECRET);
    if (!refreshToken) {
      throw new BadRequestError({
        message: "Token inválido",
        fieldName: "token",
      });
    }
    return refreshToken;
  }

  private validateConfig(): void {
    if (!env.ACCESS_TOKEN_SECRET) {
      throw new BadRequestError({
        message: "JWT secretKey não pode ser vazio",
        fieldName: "secretKey",
      });
    }

    if (!env.ACCESS_TOKEN_EXPIRES_IN) {
      throw new BadRequestError({
        message: "JWT expiresIn não pode ser vazio",
        fieldName: "expiresIn",
      });
    }
  }
}
