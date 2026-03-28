import bcrypt from "bcrypt";

import { prisma } from "@/lib/db.js";
import { signJwt } from "@/modulos/auth/jwt.js";

import { UnauthorizedError } from "../errors/index.js";

interface InputDto {
  email: string;
  senha: string;
}

interface OutputDto {
  token: string;
}

export class AuthenticateAdmin {
  async execute({ email, senha }: InputDto): Promise<OutputDto> {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const isSenhaValida = await bcrypt.compare(senha, admin.password);

    if (!isSenhaValida) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const token = signJwt({ sub: String(admin.id), role: "admin" });

    return { token };
  }
}
