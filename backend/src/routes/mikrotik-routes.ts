import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ErrorSchema } from "@/schemas/error.js";
import { ParamsIdStringSchema } from "@/schemas/generic.js";
import {
  CreateMikrotikRouterSchema,
  MikrotikRouterSchema,
  UpdateMikrotikRouterSchema,
} from "@/schemas/mikrotik.js";

import { NotFoundError } from "../errors/index.js";
import {
  CreateMikrotik,
  DeleteMikrotik,
  GetMikrotik,
  GetMikrotiks,
  UpdateMikrotik,
} from "../usecases/MikrotikUseCases.js";

export const mikrotikRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Mikrotiks"],
      summary: "Listar todos os mikrotiks",
      response: {
        200: z.array(MikrotikRouterSchema),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetMikrotiks().execute();
        const mapped = result.map((dto) => ({
          id: String(dto.id),
          name: dto.name,
          ipAddress: dto.ip,
          username: dto.username,
          password: dto.password,
          port: dto.port,
          status: dto.status,
          activeUsers: dto.activeUsers,
          hotspotUrl: dto.hotspotUrl,
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt,
        }));
        return reply.status(200).send(mapped);
      } catch (error) {
        app.log.error(error);
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:id",
    schema: {
      tags: ["Mikrotiks"],
      summary: "Buscar mikrotik por ID",
      params: ParamsIdStringSchema,
      response: {
        200: MikrotikRouterSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const result = await new GetMikrotik().execute(id);
        const mapped = {
          id: result.id,
          name: result.name,
          ipAddress: result.ip,
          username: result.username,
          password: result.password,
          port: result.port,
          status: result.status,
          activeUsers: result.activeUsers,
          hotspotUrl: result.hotspotUrl,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        };
        return reply.status(200).send(mapped);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: error.code });
        }
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Mikrotiks"],
      summary: "Criar mikrotik",
      body: CreateMikrotikRouterSchema,
      response: {
        201: MikrotikRouterSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body;
        const result = await new CreateMikrotik().execute({
          name: body.name,
          ip: body.ipAddress,
          username: body.username,
          password: body.password,
          port: body.port,
          hotspotUrl: body.hotspotUrl,
        });
        const mapped = {
          id: result.id,
          name: result.name,
          ipAddress: result.ip,
          username: result.username,
          password: result.password,
          port: result.port,
          status: result.status,
          activeUsers: result.activeUsers,
          hotspotUrl: result.hotspotUrl,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        };
        return reply.status(201).send(mapped);
      } catch (error) {
        app.log.error(error);
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:id",
    schema: {
      tags: ["Mikrotiks"],
      summary: "Atualizar mikrotik",
      params: ParamsIdStringSchema,
      body: UpdateMikrotikRouterSchema,
      response: {
        200: MikrotikRouterSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const body = request.body;
        const result = await new UpdateMikrotik().execute({
          id,
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.ipAddress !== undefined
            ? { ipAddress: body.ipAddress }
            : {}),
          ...(body.username !== undefined ? { username: body.username } : {}),
          ...(body.password !== undefined ? { password: body.password } : {}),
          ...(body.port !== undefined ? { port: body.port } : {}),
          ...(body.hotspotUrl !== undefined
            ? { hotspotUrl: body.hotspotUrl }
            : {}),
        });
        const mapped = {
          id: result.id,
          name: result.name,
          ipAddress: result.ip,
          username: result.username,
          password: result.password,
          port: result.port,
          status: result.status,
          activeUsers: result.activeUsers,
          hotspotUrl: result.hotspotUrl,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        };
        return reply.status(200).send(mapped);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: error.code });
        }
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:id",
    schema: {
      tags: ["Mikrotiks"],
      summary: "Deletar mikrotik",
      params: ParamsIdStringSchema,
      response: {
        204: z.null(),
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        await new DeleteMikrotik().execute(id);
        return reply.status(204).send(null);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: error.code });
        }
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });
};
