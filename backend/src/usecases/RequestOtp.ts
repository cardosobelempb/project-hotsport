import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';

import { prisma } from '../lib/db.js';

// ── RequestOtp ────────────────────────────────────────────────────────────────

interface RequestOtpInputDto {
  cpf: string;
  phone: string;
  name?: string;
}

interface RequestOtpOutputDto {
  /** Plain-text OTP to be sent via WhatsApp (never stored) */
  otp: string;
  expiresAt: string;
  userId: string;
}

/**
 * Upserts the User record by CPF, generates a 6-digit OTP, hashes it with
 * bcrypt and stores it in UserOtp. Returns the plain-text OTP so the caller
 * (route/WhatsApp gateway) can dispatch it.
 *
 * No try/catch — errors propagate to the route layer.
 */
export class RequestOtp {
  async execute(dto: RequestOtpInputDto): Promise<RequestOtpOutputDto> {
    const user = await prisma.user.upsert({
      where: { cpf: dto.cpf },
      update: {
        phone: dto.phone,
        ...(dto.name !== undefined ? { name: dto.name } : {}),
      },
      create: {
        cpf: dto.cpf,
        phone: dto.phone,
        name: dto.name ?? null,
      },
    });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hash = await bcrypt.hash(otp, 10);
    const expiresAt = dayjs().add(10, 'minute').toDate();

    await prisma.userOtp.create({
      data: {
        user_id: user.id,
        hash,
        expires_at: expiresAt,
        attempts: 0,
        used: false,
      },
    });

    return {
      otp,
      expiresAt: dayjs(expiresAt).toISOString(),
      userId: user.id,
    };
  }
}
