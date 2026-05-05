import { CodeError } from "@/common/domain/errors/usecases/code.error";
import { UnauthorizedError } from "@/common/domain/errors/usecases/unauthorized.error";
import { env } from "@/common/infrastructure/env";

import { UserMapper } from "@/modulos/identity/domain/mappers/user-mapper";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { PrismaUserRepository } from "@/modulos/identity/infrastructure/http/repositories/prisma/prisma-user.repository";
import { JwtPayload, verify } from "jsonwebtoken";
import { AuthSessionResponseType } from "../../infrastructure/http/schemas/session-auth.schema";

export interface AuthSessionUseCaseInput {
  accessToken: string;
}

type AuthSessionUseCaseOutput = AuthSessionResponseType;

export type AuthSessionUseCaseResult = Either<
  UnauthorizedError,
  AuthSessionUseCaseOutput
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

export class AuthSessionUseCase {
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

    return right({ user: UserMapper.toPresenter(user) });
  }
}
