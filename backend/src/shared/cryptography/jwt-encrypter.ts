import { BaseEncrypter } from "@/core/domain/common/shared/base-encrypter";
import { sign } from "jsonwebtoken";

/**
 * Tipagem do payload do JWT
 * (pode ser ajustado conforme domínio)
 */
export type JwtPayload = {
  sub: string; // subject (userId, por exemplo)
  [key: string]: unknown;
};

/**
 * Configuração necessária para o JWT
 */
export interface JwtConfig {
  secretKey: string;
  expiresIn: number;
}

/**
 * Implementação concreta do Encrypter usando JWT
 */
export class JwtEncrypter implements BaseEncrypter<JwtPayload> {
  constructor(private readonly config: JwtConfig) {}

  /**
   * Gera um token JWT baseado no payload informado
   */
  async encrypt(payload: JwtPayload): Promise<string> {
    this.validateConfig();

    const token = sign(payload, this.config.secretKey, {
      expiresIn: this.config.expiresIn,
    });

    return token;
  }

  /**
   * Valida a configuração antes do uso
   */
  private validateConfig(): void {
    if (!this.config.secretKey) {
      throw new Error("JWT secretKey não pode ser vazio");
    }

    if (!this.config.expiresIn || this.config.expiresIn <= 0) {
      throw new Error("JWT expiresIn deve ser maior que zero");
    }
  }
}
