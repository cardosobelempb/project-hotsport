import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  createPlanController,
  deletePlanController,
  getPlanController,
  getPlansController,
  updatePlanController,
} from "../../../../shared/plan/infrastructure/controllers/index.js";
import {
  CreatePlanoSchema,
  ErrorSchema,
  PlanoSchema,
  UpdatePlanoSchema,
} from "../../../../shared/schemas/index.js";

export const planRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Planos"],
      summary: "Listar todos os planos",
      response: {
        200: z.array(PlanoSchema),
        500: ErrorSchema,
      },
    },
    handler: getPlansController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:id",
    schema: {
      tags: ["Planos"],
      summary: "Buscar plano por ID",
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: PlanoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: getPlanController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Planos"],
      summary: "Criar plano",
      body: CreatePlanoSchema,
      response: {
        201: PlanoSchema,
        500: ErrorSchema,
      },
    },
    handler: createPlanController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:id",
    schema: {
      tags: ["Planos"],
      summary: "Atualizar plano",
      params: z.object({ id: z.coerce.number().int() }),
      body: UpdatePlanoSchema,
      response: {
        200: PlanoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: updatePlanController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:id",
    schema: {
      tags: ["Planos"],
      summary: "Deletar plano",
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        204: z.null(),
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: deletePlanController,
  });
};
