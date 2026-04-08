import { Either, left, right, UnauthorizedError } from "@/core";
import { env } from "@/core/infrastructure/env";
import { UserPrismaRepository } from "@/modulos/user/infrastructure/repositories/user-prisma.repository";
import { UserMapper } from "@/modulos/user/infrastructure/schemas/user.schema";
import { verify } from "jsonwebtoken";
import { AuthSessionResponseType } from "../../infrastructure/schemas/auth.session.schema";

export interface AuthSessionUseCaseInput {
  accessToken: string;
}

type AuthSessionUseCaseOutput = AuthSessionResponseType;

export type AuthSessionUseCaseResult = Either<
  UnauthorizedError,
  AuthSessionUseCaseOutput
>;

export class AuthSessionUseCase {
  constructor(private readonly userPrismaRepository: UserPrismaRepository) {}
  async execute({
    accessToken,
  }: AuthSessionUseCaseInput): Promise<AuthSessionUseCaseResult> {
    if (!accessToken) {
      return left(new UnauthorizedError("Unauthorized"));
    }

    let payload: any;
    try {
      payload = verify(accessToken, env.ACCESS_TOKEN_SECRET_KEY || "");
    } catch (err) {
      return left(new UnauthorizedError("Unauthorized"));
    }

    if (!payload || typeof payload !== "object" || !payload.sub) {
      return left(new UnauthorizedError("Unauthorized"));
    }

    const user = await this.userPrismaRepository.findById(
      payload.sub.toString(),
    );
    if (!user) {
      return left(new UnauthorizedError("Unauthorized"));
    }

    return right({ user: UserMapper.toHttp(user) });
  }
}
