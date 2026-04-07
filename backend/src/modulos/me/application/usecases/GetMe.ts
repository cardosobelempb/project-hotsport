import type { JwtPayload } from "../../auth/jwt.js";

interface InputDto {
  payload: JwtPayload;
}

interface OutputDto {
  sub: string;
  role?: string;
}

export class GetMe {
  execute({ payload }: InputDto): OutputDto {
    const result: OutputDto = { sub: payload.sub };
    if (payload.role !== undefined) {
      result.role = payload.role;
    }
    return result;
  }
}
