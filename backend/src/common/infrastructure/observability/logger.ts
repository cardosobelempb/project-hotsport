import { FastifyBaseLogger } from "fastify";

export type LogMeta = Record<string, unknown>;

export interface Logger {
  debug(meta: LogMeta, msg?: string): void;
  info(meta: LogMeta, msg?: string): void;
  warn(meta: LogMeta, msg?: string): void;
  error(meta: LogMeta, msg?: string): void;
}

class ConsoleLogger implements Logger {
  debug(meta: LogMeta, msg = ""): void {
    // em prod você pode desabilitar debug pelo env
    if (process.env.LOG_LEVEL === "debug") console.debug(msg, meta);
  }
  info(meta: LogMeta, msg = ""): void {
    console.info(msg, meta);
  }
  warn(meta: LogMeta, msg = ""): void {
    console.warn(msg, meta);
  }
  error(meta: LogMeta, msg = ""): void {
    console.error(msg, meta);
  }
}

export function buildLogger(): Logger {
  return new ConsoleLogger();
}

/**
 * Adapter opcional: usa o logger do Fastify como Logger comum.
 */
export function fromFastifyLogger(fastifyLogger: FastifyBaseLogger): Logger {
  return {
    debug: (meta, msg) => fastifyLogger.debug(meta, msg),
    info: (meta, msg) => fastifyLogger.info(meta, msg),
    warn: (meta, msg) => fastifyLogger.warn(meta, msg),
    error: (meta, msg) => fastifyLogger.error(meta, msg),
  };
}
