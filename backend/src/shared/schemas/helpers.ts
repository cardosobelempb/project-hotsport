import { z } from "zod";

// ── Common schema helpers ───────────────────────────────────────────────────
// ✅ Tipos e validações comuns para os schemas de toda a aplicação

// ✅ Email com validação de formato
export const EmailString = z.string().email("Invalid email address");
export type EmailStringType = z.infer<typeof EmailString>;

// ✅ Senha com validação de comprimento mínimo
export const PasswordString = z
  .string()
  .min(6, "Password must be at least 6 characters");
export type PasswordStringType = z.infer<typeof PasswordString>;

// ✅ UUID como string pura, sem transformação, para o Fastify serializar
export const UUIDString = z.string().uuid("Invalid UUID format");
export type UUIDStringType = z.infer<typeof UUIDString>;

// ✅ Para INPUT (body) — aceita Date ou string e transforma
// export const IsoDateTimeInput = z
//   .union([z.string(), z.date()])
//   .transform((val) => (val instanceof Date ? val.toISOString() : val));
// export type IsoDateTimeInputType = z.infer<typeof IsoDateTimeInput>;

// ✅ Para OUTPUT (response) — sempre string pura, sem union/transform
export const IsoDateTimeOutput = z.string().datetime({ offset: true });
export type IsoDateTimeOutputType = z.infer<typeof IsoDateTimeOutput>;

// ✅ Validações customizadas para CPF e telefone
export const CpfString = z
  .string()
  .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF must have 11 digits");
export type CpfStringType = z.infer<typeof CpfString>;

// ✅ Validação simples para números de telefone (ajuste a regex conforme necessário)
export const PhoneString = z
  .string()
  .regex(/^\+?[\d\s\-().]{10,20}$/, "Invalid phone number");
export type PhoneStringType = z.infer<typeof PhoneString>;

// ✅ Helper para transformar strings separadas por vírgula em arrays
export const parseEnvArray = (value: string): string[] => {
  return value.split(",").map((item) => item.trim());
};

// ── Password confirmation helper ──────────────────────────────────────────────
// ✅ Adiciona validação de confirmação de senha a um schema existente
export const withPasswordConfirmation = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  fields: { passwordHash: string; passwordConfirmation: string } = {
    passwordHash: "passwordHash",
    passwordConfirmation: "passwordConfirmation",
  },
) => {
  return schema.superRefine((data, ctx) => {
    const record = data as Record<string, unknown>;

    if (record[fields.passwordHash] !== record[fields.passwordConfirmation]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: [fields.passwordConfirmation],
      });
    }
  });
};

export const UuidSchema = z.string().uuid("ID inválido");
export const EmailSchema = z.string().email("E-mail inválido").max(255);
export const CpfSchema = z.string().min(11).max(14);
export const PhoneSchema = z.string().min(8).max(30);
export const CurrencySchema = z
  .string()
  .length(3)
  .transform((value) => value.toUpperCase());
export const MoneySchema = z.number().positive("Valor deve ser maior que zero");
export const SortDirectionSchema = z.enum(["asc", "desc"]);

/**
 * Aceita string ISO ou Date e normaliza para string ISO.
 * Necessário porque Fastify serializa Date como objeto — não string.
 *
 * @example
 * createdAt: IsoDateTimeInput           // obrigatório
 * updatedAt: IsoDateTimeInput.nullable() // opcional nulo
 */

/**
 * UUID string validado
 */
export const UUIDSchema = z.string().uuid();

/**
 * INPUT — Aceita string ISO ou Date, converte para Date.
 * Usar em: body, querystring, params.
 */
export const IsoDateTimeInput = z.coerce.date();

/**
 * OUTPUT — Fastify já recebe string ISO do mapper.
 * Usar em: response schemas.
 *
 * Não usa transform — Fastify serializa o valor como está.
 */
// export const IsoDateTimeOutput = z.string().datetime({ offset: true });
