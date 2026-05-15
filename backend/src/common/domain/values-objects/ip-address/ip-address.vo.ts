// ============================================================
// src/common/domain/value-objects/ip-address.vo.ts
// Compatível com sua BaseVO atual
// ============================================================

import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

/**
 * 🌍 IpAddressVO - IPv4/IPv6 validation & features
 */
export class IpAddressVO extends BaseVO<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * ✅ Factory com validação completa
   */
  public static create(value: string): IpAddressVO {
    const normalized = value.trim();

    if (!IpAddressVO.isValidStatic(normalized)) {
      throw new BadRequestError({
        fieldName: "ipAddress",
        value,
        message: `Invalid IP address: "${value}". Must be a valid IPv4 or IPv6 address.`,
      });
    }

    return new IpAddressVO(normalized);
  }

  /**
   * ✅ Validação ESTÁTICA para factory
   */
  private static isValidStatic(value: string): boolean {
    return IpAddressVO.isValidIPv4(value) || IpAddressVO.isValidIPv6(value);
  }

  /**
   * ✅ INSTANCE isValid() - SEM parâmetros (sua BaseVO)
   */
  public isValid(): boolean {
    return IpAddressVO.isValidStatic(this.value);
  }

  /**
   * ✅ Static validate para pré-validação
   */
  public static validate(value: string): boolean {
    return IpAddressVO.isValidStatic(value.trim());
  }

  private static isValidIPv4(ip: string): boolean {
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
  }

  private static isValidIPv6(ip: string): boolean {
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv6Regex.test(ip);
  }

  /**
   * 🔍 Métodos de negócio
   */
  public isIPv4(): boolean {
    return IpAddressVO.isValidIPv4(this.value);
  }

  public isIPv6(): boolean {
    return !this.isIPv4();
  }

  public isPrivate(): boolean {
    if (this.isIPv4()) {
      return IpAddressVO.isPrivateIPv4(this.value);
    }
    return IpAddressVO.isPrivateIPv6(this.value);
  }

  public isPublic(): boolean {
    return !this.isPrivate();
  }

  private static isPrivateIPv4(ip: string): boolean {
    return [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^127\./, // Loopback
    ].some((regex) => regex.test(ip));
  }

  private static isPrivateIPv6(ip: string): boolean {
    return ip.startsWith("fc00:") || ip.startsWith("fd"); // Unique Local Addresses
  }

  /**
   * 📊 Suporte a CIDR (simplificado)
   */
  public static fromCIDR(cidr: string): { ip: IpAddressVO; prefix: number } {
    const parts = cidr.split("/");
    const ip = parts[0];
    const prefix = parts[1];

    if (!ip) {
      throw new BadRequestError({
        fieldName: "cidr",
        value: cidr,
        message: `Invalid CIDR notation: "${cidr}". Must be in format "IP/Prefix"`,
      });
    }

    return {
      ip: IpAddressVO.create(ip),
      prefix: parseInt(prefix ?? "32"),
    };
  }
}

// Exemplo de uso:
/**
 1. Client: IpAddressVO.create("192.168.1.1")
2. Factory: isValidStatic() → new IpAddressVO()
3. Entity: mikrotik.host.isValid() ✅
4. Domain: mikrotik.host.isPrivate() ✅
5. Controller: IpAddressVO.validate("invalid-ip") → false
6. Controller: IpAddressVO.create("invalid-ip") → BadRequestError
 */
