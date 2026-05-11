import { CodeError } from "@/common/domain/errors/usecases/code.error";
import { UnauthorizedError } from "@/common/domain/errors/usecases/unauthorized.error";
import { env } from "@/common/infrastructure/env";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { PrismaUserRepository } from "@/modulos/identity/infrastructure/repositories/prisma/prisma-user.repository";
import { JwtPayload, verify } from "jsonwebtoken";
import { SessionEntity } from "../../domain/entities/session.entity";
import { SessionMapper } from "../../domain/mappers/session.mapper";
import { SessionSummaryDto } from "../dto/session.dto";

export interface AuthSessionUseCaseInput {
  accessToken: string;
}

export type AuthSessionUseCaseResult = Either<
  UnauthorizedError,
  SessionSummaryDto
>;

const verifyToken = (
  token: string,
  secret: string,
): JwtPayload | string | null => {
  try {
    return verify(token, secret);
  } catch {
    return null;
  }
};

export class SessionUseCase {
  constructor(private readonly userPrismaRepository: PrismaUserRepository) {}
  async execute({
    accessToken,
  }: AuthSessionUseCaseInput): Promise<AuthSessionUseCaseResult> {
    if (!accessToken) {
      return left(
        new UnauthorizedError({
          fieldName: "accessToken",
          value: accessToken,
          message: `${CodeError.UNAUTHORIZED}: Access token is required`,
        }),
      );
    }

    const decoded = verifyToken(accessToken, env.ACCESS_TOKEN_SECRET || "");

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("sub" in decoded) ||
      !decoded.sub
    ) {
      return left(
        new UnauthorizedError({
          fieldName: "accessToken",
          value: accessToken,
          message: `${CodeError.UNAUTHORIZED}: Access token is required`,
        }),
      );
    }

    const user = await this.userPrismaRepository.findById(
      decoded.sub.toString(),
    );
    if (!user) {
      return left(
        new UnauthorizedError({
          fieldName: "accessToken",
          value: accessToken,
          message: `${CodeError.UNAUTHORIZED}: Access token is required`,
        }),
      );
    }

    const session = SessionEntity.create({
      sessionToken: accessToken,
      userId: UUIDVO.create(decoded.sub.toString()),
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 dia
    });

    return right(SessionMapper.toSummary(session));
  }
}
