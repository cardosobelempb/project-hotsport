import { ValidationError } from "@/common/domain/errors/ValidationError";
import dayjs from "dayjs";
import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Estrutura padrão de erro HTTP
 * Facilita consistência e observabilidade
 */
interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  path?: string;
  timestamp: string;
}

/**
 * Middleware global de tratamento de erros
 * Deve ser registrado como ÚLTIMO middleware do Fastify
 */
export function errorHandler(
  err: unknown,
  req: FastifyRequest,
  res: FastifyReply,
): FastifyReply {
  /**
   * Erros de domínio (esperados)
   */
  if (err instanceof ValidationError) {
    const response: ErrorResponse = {
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
      path: err.path,
      timestamp: dayjs().toISOString(),
    };

    return res.status(err.statusCode).send(response);
  }

  /**
   * Log estruturado para erros inesperados
   * Em produção, substituir por logger (pino/winston)
   */
  console.error("[Unhandled Error]", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.url,
    method: req.method,
  });

  /**
   * Erro genérico para o cliente
   * (não vazar detalhes internos)
   */
  const response: ErrorResponse = {
    statusCode: 500,
    message: "Internal Server Error",
    timestamp: dayjs().toISOString(),
  };

  return res.status(500).send(response);
}
