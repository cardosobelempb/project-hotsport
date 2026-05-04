// shared/auth/jwt-encrypter.ts

import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";
import { BaseEncrypter } from "../utils/base-encrypter";
import { JwtConfig, JwtPayload } from "../utils/types/jwt.types";

/**
 * Implementação JWT completa:
 * - encrypt (sign)
 * - decrypt (verify)
 */
export class JwtEncrypter implements BaseEncrypter<JwtPayload> {
  constructor(private readonly config: JwtConfig) {}

  /**
   * Gera um token JWT
   */
  async encrypt(payload: JwtPayload): Promise<string> {
    this.validateConfig();

    return sign(payload, this.config.secretKey, {
      expiresIn: this.config.expiresIn,
    });
  }

  /**
   * Valida e decodifica o token
   */
  async decrypt(token: string): Promise<JwtPayload> {
    this.validateConfig();

    try {
      const decoded = verify(token, this.config.secretKey);

      if (typeof decoded === "string") {
        throw new Error("Token inválido: payload mal formatado");
      }

      return decoded as JwtPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new Error("Token expirado");
      }

      if (error instanceof JsonWebTokenError) {
        throw new Error("Token inválido");
      }

      throw error;
    }
  }

  /**
   * Valida configuração
   */
  private validateConfig(): void {
    if (!this.config.secretKey) {
      throw new Error("JWT secretKey não pode ser vazio");
    }

    if (!this.config.expiresIn) {
      throw new Error("JWT expiresIn não pode ser vazio");
    }
  }
}
