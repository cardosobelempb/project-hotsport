import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

// UrlVO.ts
export class UrlVO extends BaseVO<string> {
  public static create(value: string): UrlVO {
    const normalized = value.trim().replace(/\/+$/, "");
    if (!UrlVO.isValidStatic(normalized)) {
      throw new BadRequestError({
        fieldName: "url",
        value,
        message: `Invalid URL: "${value}". Must be a valid HTTP/HTTPS URL.`,
      });
    }
    return new UrlVO(normalized);
  }

  private static isValidStatic(value: string): boolean {
    try {
      const url = new URL(
        value.startsWith("http") ? value : `https://${value}`,
      );
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  }

  public isValid(): boolean {
    return UrlVO.isValidStatic(this.value);
  }
}

// Exemplo de uso:
// const url = UrlVO.create("https://example.com");
// console.log(url.value); // "https://example.com"
// const invalidUrl = UrlVO.create("invalid-url"); // Lança BadRequestError
