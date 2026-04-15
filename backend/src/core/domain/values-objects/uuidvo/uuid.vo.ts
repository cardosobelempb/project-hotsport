import { BadRequestError } from "../../errors/controllers/BadRequestError";
import { BaseVO } from "../base.vo";

/**
 * 🎯 Responsabilidade única:
 * Representar e validar um UUID v4 imutável
 */
export class UUIDVO extends BaseVO<string> {
  private static readonly UUIDV4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * 🔨 Fábrica estática para criar instâncias validadas.
   * @param uuid - UUIDv4 válido ou undefined (gera automaticamente)
   * @throws BadRequestError se o UUID for inválido
   */
  public static create(uuid?: string): UUIDVO {
    if (uuid === undefined) {
      return new UUIDVO(UUIDVO.generate());
    }

    const normalized = UUIDVO.normalize(uuid);

    if (!UUIDVO.isValid(normalized)) {
      throw new BadRequestError(`Invalid UUIDv4 format: "${uuid}"`);
    }

    return new UUIDVO(normalized);
  }

  /** 🔒 Construtor privado: força uso do método create */
  private constructor(uuid: string) {
    super(uuid);
  }

  /** 🧪 Verifica se o valor atual é válido */
  public isValid(): boolean {
    return UUIDVO.isValid(this.value);
  }

  /** ⚙️ Gera um UUIDv4 válido (criptograficamente seguro) */
  public static generate(): string {
    // crypto.randomUUID() disponível em Node 14.17+ e browsers modernos
    return crypto.randomUUID();
  }

  /** 🧩 Verifica se o formato de UUIDv4 é válido */
  public static isValid(uuid: string): boolean {
    if (!uuid || typeof uuid !== "string") return false;
    return UUIDVO.UUIDV4_REGEX.test(uuid);
  }

  /**
   * 🧹 Normaliza o UUID:
   * - Remove prefixo 'urn:uuid:'
   * - Remove espaços
   * - Converte para lowercase
   */
  private static normalize(uuid: string): string {
    return uuid
      .replace(/^urn:uuid:/i, "")
      .trim()
      .toLowerCase();
  }
}
