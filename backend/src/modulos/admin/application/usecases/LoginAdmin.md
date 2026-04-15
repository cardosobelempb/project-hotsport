import bcrypt from "bcryptjs";

import { signJwt } from "../../auth/jwt.js";
import { UnauthorizedError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

interface InputDto {
  email: string;
  password: string;
}

interface OutputDto {
  token: string;
}

export class LoginAdmin {
  async execute({ email, password }: InputDto): Promise<OutputDto> {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const token = signJwt({ sub: String(admin.id), role: "admin" });

    return { token };
  }
}
