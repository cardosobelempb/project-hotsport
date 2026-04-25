import { buildErrorResponse } from "@/common/domain/errors/build-error-response";
import { StandardError } from "@/common/domain/errors/standard.errror";
import { ValidationError } from "@/common/domain/errors/validation.error";
import dayjs from "dayjs";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import {
  FastifyValidationIssue,
  formatValidationIssues,
} from "./format-validation-issues";
import { translateErrorMessage } from "./translate-error-message";

/**
 * Estrutura padrão de erro HTTP
 * Compatível com Fastify + Zod + response schema
 */
type HttpErrorLike = Error & {
  statusCode?: number;
  code?: string;
  error?: string;
  path?: string;
  fieldName?: string;
};

type HttpIssue = {
  field: string;
  message: string;
};

type HttpErrorResponse = {
  statusCode: number;
  message: string;
  code?: string;
  error?: string;
  path?: string;
  fieldName?: string;
  timestamp?: string;
  issues?: HttpIssue[];
};

/**
 * Middleware global de tratamento de erros
 * Deve ser registrado como ÚLTIMO middleware do Fastify
 */
export function errorHandler(
  err: unknown,
  req: FastifyRequest,
  res: FastifyReply,
): FastifyReply {
  if (err instanceof StandardError) {
    return res.status(err.statusCode).send(
      buildErrorResponse({
        error: err,
        path: req.url,
      }),
    );
  }

  if (err instanceof ValidationError) {
    const json = err.toJSON();

    const response: HttpErrorResponse = {
      statusCode: json.statusCode,
      error: json.error,
      message: json.message,
      path: json.path ?? req.url,
      timestamp: dayjs().toISOString(),
    };

    if (json.fieldName) {
      response.fieldName = json.fieldName;
    }

    if (json.issues?.length) {
      response.issues = json.issues;
    }

    return res.status(json.statusCode).send(response);
  }

  /**
   * IMPORTANTE:
   * Este bloco precisa vir ANTES do bloco "statusCode in err"
   */
  if ((err as FastifyError).validation) {
    const fastifyError = err as FastifyError & {
      validation?: FastifyValidationIssue[];
      statusCode?: number;
      code?: string;
    };

    const issues = formatValidationIssues(fastifyError.validation ?? []);

    const response: HttpErrorResponse = {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      error: "Validation Error",
      message: "Existem campos inválidos na requisição.",
      path: req.url,
      timestamp: dayjs().toISOString(),
    };

    if (issues.length > 0) {
      response.issues = issues;
    }

    if (issues[0]?.field) {
      response.fieldName = issues[0].field;
    }

    return res.status(400).send(response);
  }

  /**
   * Erros HTTP/domínio genéricos
   */
  if (err instanceof Error && "statusCode" in err) {
    const httpError = err as HttpErrorLike;

    const statusCode = httpError.statusCode ?? 400;

    const response: HttpErrorResponse = {
      statusCode,
      code: httpError.code ?? "DOMAIN_ERROR",
      error: httpError.error ?? "Bad Request",
      message: httpError.message,
      path: httpError.path ?? req.url,
      timestamp: dayjs().toISOString(),
    };

    if (httpError.fieldName) {
      response.fieldName = httpError.fieldName;

      response.issues = [
        {
          field: httpError.fieldName,
          message: translateErrorMessage(httpError.message),
        },
      ];
    }

    return res.status(statusCode).send(response);
  }

  console.error("[Unhandled Error]", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.url,
    method: req.method,
  });

  const response: HttpErrorResponse = {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    error: "Internal Server Error",
    message: "Internal Server Error",
    path: req.url,
    timestamp: dayjs().toISOString(),
  };

  console.log("RESPONSE ERROR:", response);
  console.log("CAIU NO ERROR HANDLER", err);

  return res.status(500).send(response);
}
