import bcrypt from "bcryptjs";
import dayjs from "dayjs";

import { AppError, NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

const MAX_ATTEMPTS = 5;

type NextStep = "login" | "register" | "entitlement";

interface VerifyOtpInputDto {
  cpf: string;
  otp: string;
}

interface VerifyOtpOutputDto {
  verified: boolean;
  userId: string;
  cpf: string;
  name: string | null;
  phone: string | null;
  nextStep: NextStep;
}

export class VerifyOtp {
  async execute(dto: VerifyOtpInputDto): Promise<VerifyOtpOutputDto> {
    const user = await prisma.user.findUnique({ where: { cpf: dto.cpf } });

    if (!user) {
      throw new NotFoundError("Usuário não encontrado para o CPF informado");
    }

    const otpRecord = await prisma.userOtp.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: dayjs().toDate() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new AppError(
        "Nenhum OTP válido encontrado. Solicite um novo código.",
        400,
        "OTP_NOT_FOUND",
      );
    }

    const updated = await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    if (updated.attempts >= MAX_ATTEMPTS) {
      throw new AppError(
        "Número máximo de tentativas atingido. Solicite um novo código.",
        429,
        "OTP_MAX_ATTEMPTS",
      );
    }

    const valid = await bcrypt.compare(dto.otp, otpRecord.hash);

    if (!valid) {
      throw new AppError("Código OTP inválido.", 401, "OTP_INVALID");
    }

    await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const nextStep = await this.determineNextStep(dto.cpf, user.name);

    return {
      verified: true,
      userId: user.id,
      cpf: user.cpf,
      name: user.name,
      phone: user.phone,
      nextStep,
    };
  }

  private async hasActivePayment(cpf: string): Promise<boolean> {
    const payment = await prisma.payment.findFirst({
      where: {
        cpf,
        status: "approved",
        expiresAt: { gt: dayjs().toDate() },
      },
    });

    return payment !== null;
  }

  private async determineNextStep(
    cpf: string,
    name: string | null,
  ): Promise<NextStep> {
    if (await this.hasActivePayment(cpf)) {
      return "login";
    }
    if (!name) {
      return "register";
    }
    return "entitlement";
  }
}
