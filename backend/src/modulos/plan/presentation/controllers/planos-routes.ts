import { fromNodeHeaders } from "better-auth/node";
import { type FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "../../../../lib/auth.js";
import {
  createPlanController,
  deletePlanController,
  getPlanController,
  getPlansController,
  updatePlanController,
} from "../../../../shared/plan/infrastructure/controllers/index.js";
import {
  ErrorSchema,
  MessageSchema,
  PlanoCreateSchema,
  PlanoSchema,
} from "../../../../shared/schemas/index.js";

export const planosRoutes = async (app: FastifyInstance): Promise<void> => {
  app.addHook("preHandler", async (request, reply) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      return reply
        .status(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
    }
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Planos"],
      summary: "Listar todos os planos de internet",
      response: {
        200: z.array(PlanoSchema),
        401: ErrorSchema,
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
        401: ErrorSchema,
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
      summary: "Criar novo plano de internet",
      body: PlanoCreateSchema,
      response: {
        201: PlanoSchema,
        401: ErrorSchema,
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
      summary: "Atualizar plano de internet",
      params: z.object({ id: z.coerce.number().int() }),
      body: PlanoCreateSchema,
      response: {
        200: PlanoSchema,
        401: ErrorSchema,
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
      summary: "Remover plano de internet",
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: deletePlanController,
  });
};
