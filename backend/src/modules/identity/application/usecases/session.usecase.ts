import { CodeError } from "@/common/domain/errors/usecases/code.error";
import { UnauthorizedError } from "@/common/domain/errors/usecases/unauthorized.error";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { SessionEntity } from "../../domain/entities/session.entity";
import { PrismaUserRepository } from "../../infrastructure/database/prisma-user.repository";
import { SessionSummaryDto } from "../dto/session.dto";
import { SessionMapper } from "../mappers/session.mapper";
import { JwtEncrypter } from "./../../../../common/shared/auth/jwt-encrypter";

export interface AuthSessionUseCaseInput {
  accessToken: string;
}

export type AuthSessionUseCaseResult = Either<
  UnauthorizedError,
  SessionSummaryDto
>;

export class SessionUseCase {
  constructor(
    private readonly userPrismaRepository: PrismaUserRepository,
    private readonly jwtEncrypter: JwtEncrypter,
  ) {}
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

    const decoded = this.jwtEncrypter.verifyAccessToken(accessToken);

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
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 dia
      ipAddress: "",
      userAgent: "",
    });

    return right(SessionMapper.toSummary(session));
  }
}
