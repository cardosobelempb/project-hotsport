// ============================================================
// src/common/domain/value-objects/password.vo.ts
// Ajustado para BaseVO + Factory pattern
// ============================================================

import { BaseHash } from "@/common/shared/utils/base-Hash";
import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

export interface PasswordOptions {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireDigit?: boolean;
  requireSpecialChar?: boolean;
}

/**
 * 🔐 PasswordVO - Refatorado com Factory + sua BaseVO
 */
export class PasswordVO extends BaseVO<string> {
  private readonly options: Required<PasswordOptions>;
  private readonly hasher: BaseHash | undefined;

  // ✅ Privado - só via factory
  private constructor(
    value: string,
    hasher?: BaseHash,
    options?: PasswordOptions,
  ) {
    super(value);
    this.hasher = hasher;

    // Configuração com defaults
    this.options = {
      minLength: options?.minLength ?? 8,
      maxLength: options?.maxLength ?? 64,
      requireUppercase: options?.requireUppercase ?? true,
      requireLowercase: options?.requireLowercase ?? true,
      requireDigit: options?.requireDigit ?? true,
      requireSpecialChar: options?.requireSpecialChar ?? true,
    };
  }

  /**
   * ✅ Factory principal - valida + cria
   */
  public static create(
    password: string,
    hasher?: BaseHash,
    options?: PasswordOptions,
  ): PasswordVO {
    if (!password || password.trim().length === 0) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Password cannot be empty.",
      });
    }

    const instance = new PasswordVO(password.trim(), hasher, options);

    // Validação final
    if (!instance.isValid()) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Password does not meet security requirements.",
      });
    }

    return instance;
  }

  /**
   * ✅ isValid() para BaseVO - SEM parâmetros
   */
  public isValid(): boolean {
    try {
      this.validate(this.value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * ✅ Validação privada (sua lógica original)
   */
  private validate(password: string): void {
    const {
      minLength,
      maxLength,
      requireUppercase,
      requireLowercase,
      requireDigit,
      requireSpecialChar,
    } = this.options;

    if (password.length < minLength) {
      throw new BadRequestError({
        fieldName: "password",
        message: `Password must be at least ${minLength} characters.`,
      });
    }

    if (password.length > maxLength) {
      throw new BadRequestError({
        fieldName: "password",
        message: `Password must be no more than ${maxLength} characters.`,
      });
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Password must include uppercase letter.",
      });
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Password must include lowercase letter.",
      });
    }

    if (requireDigit && !/\d/.test(password)) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Password must include digit.",
      });
    }

    if (
      requireSpecialChar &&
      !/[!@#$%^&*(),.?":{}|<>_\-\\[\];'/+=~`]/.test(password)
    ) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Password must include special character.",
      });
    }
  }

  // 🔄 MÉTODOS ESTÁTICOS (mantidos)
  public static confirm(password?: string, confirmPassword?: string): void {
    if (!password || !confirmPassword) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Password and confirmation required.",
      });
    }
    if (password !== confirmPassword) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Passwords don't match.",
      });
    }
  }

  public static async validateOldPassword(
    oldPassword: string,
    oldHash: string,
    hasher: BaseHash,
  ): Promise<void> {
    const match = await hasher.compare(oldPassword, oldHash);
    if (!match) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Old password incorrect.",
      });
    }
  }

  public static generatePassword(
    length = 12,
    useUpperCase = true,
    useNumbers = true,
    useSymbols = true,
  ): string {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = lower;
    if (useUpperCase) chars += upper;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;

    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
  }

  public static isValidBcryptHash(hash?: string): boolean {
    if (!hash) return false;
    const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
    return bcryptRegex.test(hash);
  }

  // 🔐 MÉTODOS DE HASH (mantidos)
  public async hash(saltRounds = 10): Promise<string> {
    if (!this.hasher) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Hasher not provided.",
      });
    }
    return this.hasher.hash(this.value, saltRounds);
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    if (!this.hasher) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Hasher required.",
      });
    }
    return this.hasher.compare(password, hash);
  }

  public async matchesHash(hash: string): Promise<boolean> {
    if (!this.hasher) {
      throw new BadRequestError({
        fieldName: "password",
        message: "Hasher required.",
      });
    }
    return this.hasher.compare(this.value, hash);
  }
}

/**
// ✅ Factory pattern (novo)
const password = PasswordVO.create("MyP@ssw0rd123", bcryptHasher);

// ✅ BaseVO compatível
console.log(password.isValid()); // true

// ✅ Todos métodos originais preservados
await PasswordVO.validateOldPassword("old", hash, hasher);
const strongPass = PasswordVO.generatePassword(16);
PasswordVO.confirm("abc", "abc");
 */
