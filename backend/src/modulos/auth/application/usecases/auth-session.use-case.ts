import { Either, left, right } from "@/common/domain/errors/handle-errors";
import { UnauthorizedError } from "@/common/domain/errors/usecases/unauthorized.error";
import { env } from "@/common/infrastructure/env";
import { UserMapper } from "@/modulos/user/domain/mappers/user-mapper";
import { UserPrismaRepository } from "@/modulos/user/infrastructure/htttp/repositories/prisma/user-prisma.repository";
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
  constructor(private readonly userPrismaRepository: UserPrismaRepository) {}
  async execute({
    accessToken,
  }: AuthSessionUseCaseInput): Promise<AuthSessionUseCaseResult> {
    if (!accessToken) {
      return left(new UnauthorizedError("Unauthorized"));
    }

    const decoded = verifyToken(accessToken, env.ACCESS_TOKEN_SECRET_KEY || "");

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("sub" in decoded) ||
      !decoded.sub
    ) {
      return left(new UnauthorizedError("Unauthorized"));
    }

    const user = await this.userPrismaRepository.findById(
      decoded.sub.toString(),
    );
    if (!user) {
      return left(new UnauthorizedError("Unauthorized"));
    }

    return right({ user: UserMapper.toOutput(user) });
  }
}
