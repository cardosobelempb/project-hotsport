import { type FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  getPlanController,
  getPlansController,
} from "../../../../shared/plan/infrastructure/controllers/index.js";
import { ErrorSchema, PlanoSchema } from "../../../../shared/schemas/index.js";

export const planosPublicosRoutes = async (
  app: FastifyInstance,
): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Planos Públicos"],
      summary: "Listar planos disponíveis para clientes (sem autenticação)",
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
      tags: ["Planos Públicos"],
      summary: "Buscar plano público por ID",
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: PlanoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: getPlanController,
  });
};
