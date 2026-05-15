// ============================================================
// src/common/domain/value-objects/color-hex.vo.ts
// Compatível com sua BaseVO atual
// ============================================================

import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

/**
 * 🎨 ColorHexVO - HEX Color validation & manipulation
 *
 * Suporta: #RGB, #RRGGBB
 * Features: RGB conversion, luminance, contrast check
 */
export class ColorHexVO extends BaseVO<string> {
  private constructor(value: string) {
    super(value.toUpperCase());
  }

  /**
   * ✅ Factory com normalização e validação
   */
  public static create(value: string): ColorHexVO {
    const normalized = ColorHexVO.normalize(value);

    if (!ColorHexVO.isValidStatic(normalized)) {
      throw new BadRequestError({
        fieldName: "colorHex",
        value,
        message: `Invalid HEX color: "${value}". Must be in format #RGB or #RRGGBB.`,
      });
    }

    return new ColorHexVO(normalized);
  }

  /**
   * ✅ Validação ESTÁTICA para factory
   */
  private static isValidStatic(value: string): boolean {
    const hexRegex = /^#([A-F0-9]{6}|[A-F0-9]{3})$/i;
    return hexRegex.test(value);
  }

  /**
   * ✅ INSTANCE isValid() - SEM parâmetros (sua BaseVO)
   */
  public isValid(): boolean {
    return ColorHexVO.isValidStatic(this.value);
  }

  /**
   * ✅ Static validate para pré-validação
   */
  public static validate(value: string): boolean {
    return ColorHexVO.isValidStatic(ColorHexVO.normalize(value));
  }

  /**
   * 🔧 Normaliza formatos (#rgb → #rrggbb, remove espaços)
   */
  private static normalize(hex: string): string {
    hex = hex.replace("#", "").trim().toUpperCase();

    // #RGB → #RRGGBB
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    return `#${hex}`;
  }

  /**
   * 🌈 Converte HEX → RGB
   */
  public toRgb(): { r: number; g: number; b: number } {
    const hex = this.value.slice(1); // Remove #
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  /**
   * 💡 Calcula luminance (0-1) para accessibility
   */
  public getLuminance(): number {
    const { r, g, b } = this.toRgb();
    // sRGB → linear RGB → luminance (WCAG formula)
    const rgb = [r, g, b].map((c) => {
      const srgb = c / 255;
      return srgb <= 0.03928
        ? srgb / 12.92
        : Math.pow((srgb + 0.055) / 1.055, 2.4);
    });
    if (!rgb[0] || !rgb[1] || !rgb[2]) return 0; // Evita NaN
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }

  /**
   * 🌑 Detecta se cor é "escura" (luminance < 0.5)
   */
  public isDark(): boolean {
    return this.getLuminance() < 0.5;
  }

  /**
   * ☀️ Detecta se cor é "clara"
   */
  public isLight(): boolean {
    return !this.isDark();
  }

  /**
   * 🎯 Calcula contraste WCAG com outra cor
   */
  public contrastWith(other: ColorHexVO): number {
    const l1 = this.getLuminance();
    const l2 = other.getLuminance();
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * ♿ Verifica se tem contraste mínimo AA (4.5:1) com branco/preto
   */
  public hasMinimumContrast(): boolean {
    const white = ColorHexVO.create("#FFFFFF");
    const black = ColorHexVO.create("#000000");
    return Math.max(this.contrastWith(white), this.contrastWith(black)) >= 4.5;
  }

  /**
   * 🔄 Gera cor complementar (invert RGB)
   */
  public getComplementary(): ColorHexVO {
    const { r, g, b } = this.toRgb();
    const complement = ColorHexVO.create(
      `rgb(${255 - r}, ${255 - g}, ${255 - b})`,
    );
    return complement;
  }
}
