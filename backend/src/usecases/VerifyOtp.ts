import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';

import { AppError, NotFoundError } from '../errors/index.js';
import { prisma } from '../lib/db.js';

// ── VerifyOtp ─────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 5;

interface VerifyOtpInputDto {
  cpf: string;
  otp: string;
}

interface VerifyOtpOutputDto {
  userId: string;
  cpf: string;
  name: string | null;
  phone: string | null;
}

/**
 * Finds the most recent, unused, non-expired OTP for the given CPF and
 * validates the plain-text OTP against the stored hash.
 *
 * - Increments `attempts` on every call.
 * - Marks the OTP as `used` upon successful verification.
 * - Throws descriptive errors on failure (propagated to route layer).
 *
 * No try/catch — errors propagate to the route layer.
 */
export class VerifyOtp {
  async execute(dto: VerifyOtpInputDto): Promise<VerifyOtpOutputDto> {
    const user = await prisma.user.findUnique({ where: { cpf: dto.cpf } });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado para o CPF informado');
    }

    const otpRecord = await prisma.userOtp.findFirst({
      where: {
        user_id: user.id,
        used: false,
        expires_at: { gt: dayjs().toDate() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError('Nenhum OTP válido encontrado. Solicite um novo código.', 400, 'OTP_NOT_FOUND');
    }

    // Increment attempts before checking to prevent brute-force timing leaks
    const updated = await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    if (updated.attempts >= MAX_ATTEMPTS) {
      throw new AppError('Número máximo de tentativas atingido. Solicite um novo código.', 429, 'OTP_MAX_ATTEMPTS');
    }

    const valid = await bcrypt.compare(dto.otp, otpRecord.hash);

    if (!valid) {
      throw new AppError('Código OTP inválido.', 401, 'OTP_INVALID');
    }

    await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    return {
      userId: user.id,
      cpf: user.cpf,
      name: user.name,
      phone: user.phone,
    };
  }
}
