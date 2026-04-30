import bcrypt from "bcryptjs";
import dayjs from "dayjs";

import { NotFoundError, StandardError } from "@/core";
import { prisma } from "@/shared/lib/db";

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

    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: dayjs().toDate() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new StandardError({
        statusCode: 400,
        error: "OTP_NOT_FOUND",
        message: "Nenhum OTP válido encontrado. Solicite um novo código.",
      });
    }

    const updated = await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    if (updated.attempts >= MAX_ATTEMPTS) {
      throw new StandardError({
        statusCode: 429,
        error: "OTP_MAX_ATTEMPTS",
        message:
          "Número máximo de tentativas atingido. Solicite um novo código.",
      });
    }

    const valid = await bcrypt.compare(dto.otp, otpRecord.codeHash);

    if (!valid) {
      throw new StandardError({
        statusCode: 401,
        error: "OTP_INVALID",
        message: "Código OTP inválido.",
      });
    }

    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { usedAt: dayjs().toDate() },
    });

    const nextStep = await this.determineNextStep(dto.cpf, user.firstName);

    return {
      verified: true,
      userId: user.id,
      cpf: user.cpf,
      name: user.firstName,
      phone: user.phoneNumber,
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
