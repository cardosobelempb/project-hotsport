import { BaseI18n } from "../../common/shared/base-I18n";
import { BadRequestError } from "../../errors/controllers/BadRequestError";
import { BaseVO } from "../base.vo";

interface EmailOptions {
  i18n?: BaseI18n;
}

export class EmailVO extends BaseVO<{ value: string; label?: string }> {
  private constructor(
    value: string,
    label?: string,
    private readonly options?: EmailOptions,
  ) {
    const normalized = EmailVO.normalize(value);
    const t = options?.i18n?.t.bind(options.i18n) ?? EmailVO.defaultMessages;

    if (!EmailVO.isValid(normalized)) {
      throw new BadRequestError(
        t("errors.email.invalid", { args: { email: value } }),
      );
    }

    // ✅ super() recebe o valor já normalizado — sem mutação depois
    super(
      label !== undefined
        ? { value: normalized, label }
        : { value: normalized },
    );
  }

  public isValid(): boolean {
    return EmailVO.isValid(this.value.value);
  }

  public static create(
    value: string,
    label?: string,
    options?: EmailOptions,
  ): EmailVO {
    return new EmailVO(value, label, options);
  }

  private static normalize(email: string): string {
    const [local, domain] = email.trim().split("@");
    return `${local}@${domain?.toLowerCase() ?? ""}`;
  }

  public static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public getLabel(): string | undefined {
    return this.value.label;
  }

  public withLabel(label: string): EmailVO {
    return new EmailVO(this.value.value, label, this.options);
  }

  public toJSON(): { value: string; label?: string } {
    const json: { value: string; label?: string } = { value: this.value.value };

    if (this.value.label !== undefined) {
      json.label = this.value.label;
    }

    return json;
  }

  public toString(): string {
    return this.value.value;
  }

  private static defaultMessages(
    key: string,
    options?: { args?: Record<string, any> },
  ): string {
    const args = options?.args ?? {};
    const messages: Record<string, string> = {
      "errors.email.invalid": `Endereço de email inválido: "${args.email ?? ""}"`,
    };
    return messages[key] ?? key;
  }
}
