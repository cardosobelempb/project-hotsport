// ============================================================
// MacAddressVO.ts - CORRIGIDO para sua BaseVO
// ============================================================

import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

export class MacAddressVO extends BaseVO<string> {
  private static readonly OUI_DATABASE = new Set([
    "00:50:56",
    "00:0C:29",
    "08:00:27",
    "52:54:00",
  ]);

  private constructor(value: string) {
    super(value);
  }

  /**
   * ✅ Factory com validação - lança erro se inválido
   */
  public static create(value: string): MacAddressVO {
    const normalized = MacAddressVO.normalize(value);

    if (!MacAddressVO.isValidStatic(normalized)) {
      throw new BadRequestError({
        fieldName: "macAddress",
        value,
        message: `Invalid MAC address: "${value}". Must be in format "XX:XX:XX:XX:XX:XX"`,
      });
    }

    return new MacAddressVO(normalized);
  }

  /**
   * ✅ Validação ESTÁTICA para factory
   */
  private static isValidStatic(value: string): boolean {
    const macRegex = /^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/i;
    return macRegex.test(value);
  }

  /**
   * ✅ INSTANCE isValid() - SEM parâmetros (compatível BaseVO)
   */
  public isValid(): boolean {
    return MacAddressVO.isValidStatic(this.value);
  }

  /**
   * ✅ Static validate para uso prévio
   */
  public static validate(value: string): boolean {
    return this.isValidStatic(this.normalize(value));
  }

  private static normalize(mac: string): string {
    return (
      mac
        .replace(/[^a-fA-F0-9]/g, "")
        .match(/.{1,2}/g)
        ?.join(":") ?? ""
    );
  }

  public getOUI(): string {
    return this.value.slice(0, 8).toUpperCase();
  }

  public isVirtual(): boolean {
    return MacAddressVO.OUI_DATABASE.has(this.getOUI());
  }
}

// Exemplo de uso:
// const mac = MacAddressVO.create("00:50:56:AA:BB:CC");
// console.log(mac.value); // "00:50:56:AA:BB:CC"
// console.log(mac.isVirtual()); // true
// const invalidMac = MacAddressVO.create("invalid-mac"); // Lança BadRequestError
// const normalizedMac = MacAddressVO.create("005056AABBCC");
// console.log(normalizedMac.value); // "00:50:56:AA:BB:CC"

/**
  1. Client chama: MacAddressVO.create("00:11:22:33:44:55")
  2. Factory: normalize() → isValidStatic() → new MacAddressVO()
  3. Entity: new MikrotikEntity({ macAddress: macVO })
  4. Domain: macVO.isValid() ✅ (instance method)
  5. Domain: macVO.isVirtual() ✅ (instance method)
  6. Controller: MacAddressVO.validate("invalid-mac") → false
  7. Controller: MacAddressVO.create("invalid-mac") → BadRequestError
 */
