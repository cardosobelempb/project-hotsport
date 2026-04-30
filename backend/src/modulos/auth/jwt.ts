import { CodeError } from "@/common/domain/errors/usecases/code.error";
import { UnauthorizedError } from "@/common/domain/errors/usecases/unauthorized.error";
import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  role?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    jwtPayload?: JwtPayload;
  }
}

const getSecret = (): string => {
  const secret = process.env["JWT_SECRET"];
  if (!secret)
    throw new Error("JWT_SECRET environment variable is not defined");
  return secret;
};

export const signJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: "1d" });
};

export const verifyJwt = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded === "string") {
    throw new UnauthorizedError({
      fieldName: "token",
      value: token,
      message: `${CodeError.UNAUTHORIZED}: Invalid token`,
    });
  }
  const result: JwtPayload = { sub: String(decoded["sub"]) };
  if (typeof decoded["role"] === "string") {
    result.role = decoded["role"];
  }
  return result;
};

export const getBearerToken = (
  headers: FastifyRequest["headers"],
): string | null => {
  const authHeader = headers["authorization"];
  if (typeof authHeader !== "string") return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) return null;
  return parts[1];
};

export const requireAuth = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const token = getBearerToken(request.headers);
  if (!token) {
    await reply
      .status(401)
      .send({ error: "Token não fornecido", code: "UNAUTHORIZED_ERROR" });
    return;
  }
  try {
    request.jwtPayload = verifyJwt(token);
  } catch {
    await reply.status(401).send({
      error: "Token inválido ou expirado",
      code: "UNAUTHORIZED_ERROR",
    });
  }
};
