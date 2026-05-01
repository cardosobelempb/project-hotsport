// ============================================================
// response.factory.ts
// Factory genérica de response schemas para rotas Fastify.
//
// Elimina a repetição de 400/409/422/500 em cada rota.
// Basta passar o schema de sucesso — os erros vêm automático.
// ============================================================

import { z } from "zod";

import { ErrorSchema, ValidationErrorSchema } from "./error";
import { PageSchema } from "./pagination-schema";

/**
 * Códigos de erro padrão reutilizados em todas as rotas.
 * Centraliza para facilitar manutenção global.
 */
const defaultErrors = {
  400: ErrorSchema,
  409: ErrorSchema,
  422: ValidationErrorSchema,
  500: ErrorSchema,
  default: ErrorSchema,
} as const;

// ─── Factories por padrão de rota ────────────────────────────────────────────

/**
 * POST — criação de recurso (201 + erros padrão)
 *
 * @example
 * response: createResponseSchema(z.object({ organization: OrganizationSchema }))
 */
export const createResponseSchema = <T extends z.ZodTypeAny>(
  successSchema: T,
) => ({
  201: successSchema,
  ...defaultErrors,
});

/**
 * GET — busca de recurso (200 + erros padrão)
 *
 * @example
 * response: findResponseSchema(z.object({ organization: OrganizationSchema }))
 */
export const findResponseSchema = <T extends z.ZodTypeAny>(
  successSchema: T,
) => ({
  200: successSchema,
  ...defaultErrors,
});

/**
 * PUT/PATCH — atualização de recurso (200 + erros padrão)
 *
 * @example
 * response: updateResponseSchema(z.object({ organization: OrganizationSchema }))
 */
export const updateResponseSchema = <T extends z.ZodTypeAny>(
  successSchema: T,
) => ({
  200: successSchema,
  ...defaultErrors,
});

/**
 * DELETE — remoção de recurso (204 sem body + erros padrão)
 */
export const deleteResponseSchema = () => ({
  204: z.null(),
  ...defaultErrors,
});

/**
 * Ação customizada — ex: activate, deactivate, approve (200 + mensagem)
 *
 * @example
 * response: actionResponseSchema()  // { message: '...' }
 */
export const actionResponseSchema = () => ({
  200: z.object({ message: z.string() }),
  ...defaultErrors,
});

/**
 * Listagem paginada — Page<T> (200 + erros padrão)
 *
 * @example
 * response: pageResponseSchema(OrganizationSchema)
 */
export const pageResponseSchema = <T extends z.ZodTypeAny>(
  contentSchema: T,
) => ({
  200: PageSchema(contentSchema),
  ...defaultErrors,
});
