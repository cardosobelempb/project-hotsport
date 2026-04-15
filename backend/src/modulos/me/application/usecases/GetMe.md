<<<<<<< HEAD:backend/src/modulos/me/application/usecases/GetMe.md
import type { JwtPayload } from "../../auth/jwt.js";
=======
import type { JwtPayload } from "../modulos/auth/jwt.js";
>>>>>>> main:backend/src/usecases/GetMe.ts

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
