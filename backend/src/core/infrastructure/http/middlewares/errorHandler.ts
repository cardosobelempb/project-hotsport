import dayjs from "dayjs";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";

import { ValidationError } from "@/core/domain/errors/validation.error";
import { Prisma } from "../../../../../generated/prisma";

interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  path?: string;
  timestamp: string;
  issues?: { field: string; message: string }[];
}

function buildResponse(
  statusCode: number,
  message: string,
  req: FastifyRequest,
  extra?: Partial<ErrorResponse>,
): ErrorResponse {
  return {
    statusCode,
    message,
    path: req.url,
    timestamp: dayjs().toISOString(),
    ...extra,
  };
}

function logWarn(label: string, data: Record<string, unknown>): void {
  console.warn(`\x1b[33m[WARN] ${label}\x1b[0m`, JSON.stringify(data, null, 2));
}

function logError(label: string, data: Record<string, unknown>): void {
  console.error(
    `\x1b[31m[ERROR] ${label}\x1b[0m`,
    JSON.stringify(data, null, 2),
  );
}

export function errorHandler(
  err: unknown,
  req: FastifyRequest,
  res: FastifyReply,
): FastifyReply {
  // ─── Domínio ──────────────────────────────────────────────────────────
  if (err instanceof ValidationError) {
    const fieldErrors = err.getFieldErrors();

    logWarn("[ValidationError]", {
      message: err.message,
      statusCode: err.statusCode,
      path: req.url,
      method: req.method,
      // ✅ agora loga os erros por campo também
      errors: fieldErrors,
    });

    return res.status(err.statusCode).send({
      ...buildResponse(err.statusCode, err.message, req, {
        error: err.error,
        path: err.path ?? req.url,
      }),
      // ✅ inclui os erros por campo na resposta HTTP
      errors: fieldErrors,
    });
  }

  // ─── Zod: erro de validação do BODY/QUERY/PARAMS ───────────────────────
  // fastify-type-provider-zod intercepta o ZodError e o encapsula
  // err instanceof ZodError nunca bate — precisa usar hasZodFastifySchemaValidationErrors
  if (hasZodFastifySchemaValidationErrors(err)) {
    const issues = err.validation.map((issue) => ({
      field: issue.instancePath.replace(/^\//, "").replace(/\//g, "."),
      message: issue.message ?? "Campo inválido",
    }));

    logWarn("[ZodError]", {
      issues,
      path: req.url,
      method: req.method,
    });

    return res.status(422).send(
      buildResponse(422, "Erro de validação", req, {
        error: "Unprocessable Entity",
        issues,
      }),
    );
  }

  // ─── Zod: erro de serialização da RESPONSE ─────────────────────────────
  if (isResponseSerializationError(err)) {
    logError("[ZodSerializationError]", {
      message: err.message,
      path: req.url,
      method: req.method,
    });

    return res.status(500).send(
      buildResponse(500, "Erro ao serializar resposta", req, {
        error: "Internal Server Error",
      }),
    );
  }

  // ─── Prisma: erros conhecidos ──────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logWarn("[PrismaError]", {
      code: err.code,
      meta: err.meta,
      path: req.url,
      method: req.method,
    });

    if (err.code === "P2002") {
      const fields = (err.meta?.target as string[])?.join(", ") ?? "campo";
      return res.status(409).send(
        buildResponse(409, `Já existe um registro com esse ${fields}`, req, {
          error: "Conflict",
        }),
      );
    }

    if (err.code === "P2025") {
      return res.status(404).send(
        buildResponse(404, "Registro não encontrado", req, {
          error: "Not Found",
        }),
      );
    }

    if (err.code === "P2003") {
      return res.status(400).send(
        buildResponse(
          400,
          "Referência inválida: registro relacionado não existe",
          req,
          {
            error: "Bad Request",
          },
        ),
      );
    }

    return res
      .status(400)
      .send(
        buildResponse(400, "Erro no banco de dados", req, { error: err.code }),
      );
  }

  // ─── Prisma: validação ─────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    logWarn("[PrismaValidationError]", {
      message: err.message,
      path: req.url,
      method: req.method,
    });

    return res.status(400).send(
      buildResponse(400, "Dados inválidos enviados ao banco de dados", req, {
        error: "Bad Request",
      }),
    );
  }

  // ─── Prisma: conexão ───────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientInitializationError) {
    logError("[PrismaInitError]", {
      message: err.message,
      path: req.url,
      method: req.method,
    });

    return res.status(503).send(
      buildResponse(503, "Não foi possível conectar ao banco de dados", req, {
        error: "Service Unavailable",
      }),
    );
  }

  // ─── Fallback ──────────────────────────────────────────────────────────
  logError("[UnhandledError]", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.url,
    method: req.method,
  });

  return res.status(500).send(buildResponse(500, "Internal Server Error", req));
}
