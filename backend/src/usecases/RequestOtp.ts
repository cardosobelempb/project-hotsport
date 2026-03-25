import axios from 'axios';
import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import dayjs from 'dayjs';

import { RateLimitError } from '../errors/index.js';
import { prisma } from '../lib/db.js';

// ── CPF validation ────────────────────────────────────────────────────────────

const OTP_MIN_INTERVAL_SECONDS = 60;
const OTP_MAX_PER_HOUR = 5;
const MSG_COOLDOWN = 'Aguarde 60 segundos antes de solicitar um novo código.';
const MSG_HOURLY_LIMIT = 'Limite de solicitações atingido. Tente novamente em uma hora.';

interface RequestOtpInputDto {
  cpf: string;
  telefone: string;
}

interface OutputDto {
  status: 'enviado' | 'erro';
  detail?: string;
}

/**
 * Upserts the User record by CPF, generates a 6-digit OTP, hashes it with
 * bcrypt and stores it in UserOtp. Returns the plain-text OTP so the caller
 * (route/WhatsApp gateway) can dispatch it.
 *
 * Rate limits are enforced before any write:
 *   - Max 1 request per 60 seconds per CPF or phone
 *   - Max 5 requests per hour per CPF or phone
 *
 * No try/catch — errors propagate to the route layer.
 */
export class RequestOtp {
  async execute(dto: RequestOtpInputDto): Promise<RequestOtpOutputDto> {
    const now = dayjs();
    const oneHourAgo = now.subtract(1, 'hour').toDate();
    const cooldownThreshold = now.subtract(OTP_MIN_INTERVAL_SECONDS, 'second').toDate();

    await this.checkRateLimitByCpf(dto.cpf, oneHourAgo, cooldownThreshold);
    await this.checkRateLimitByPhone(dto.phone, oneHourAgo, cooldownThreshold);

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
    if (recentOtp) {
      throw new ConflictError('Aguarde antes de solicitar um novo código OTP');
    }

    const otp = String(randomInt(100_000, 1_000_000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = dayjs().add(5, 'minute').toDate();

    const whatsappUrl =
      process.env['WHATSAPP_SERVER_URL'] ?? 'http://127.0.0.1:3030';
    const whatsappToken = process.env['WHATSAPP_SERVER_TOKEN'] ?? '';

    const mensagem = `Seu código de acesso é: *${otp}*\nEle expira em 5 minutos. Não compartilhe com ninguém.`;

    await axios
      .post(
        `${whatsappUrl}/send`,
        { telefone: telefoneNormalizado, mensagem },
        {
          headers: { 'x-whatsapp-token': whatsappToken },
          timeout: 10_000,
        },
      )
      .catch(() => {
        throw new WhatsappError();
      });

    await prisma.otpRequest.create({
      data: {
        cpf: cpfNormalizado,
        telefone: telefoneNormalizado,
        otp_hash: otpHash,
        expires_at: expiresAt,
        max_attempts: 5,
      },
    });

    return { status: 'enviado' };
  }

  /**
   * Checks rate limits for a given CPF.
   * Does nothing if the user does not yet exist (first-time request).
   */
  private async checkRateLimitByCpf(
    cpf: string,
    oneHourAgo: Date,
    cooldownThreshold: Date,
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { cpf },
      select: { id: true },
    });

    if (!user) return;

    const lastOtp = await prisma.userOtp.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      select: { created_at: true },
    });

    if (lastOtp && lastOtp.created_at > cooldownThreshold) {
      throw new RateLimitError(MSG_COOLDOWN);
    }

    const cpfRequestsLastHour = await prisma.userOtp.count({
      where: { user_id: user.id, created_at: { gte: oneHourAgo } },
    });

    if (cpfRequestsLastHour >= OTP_MAX_PER_HOUR) {
      throw new RateLimitError(MSG_HOURLY_LIMIT);
    }
  }

  /**
   * Checks rate limits across all users sharing the same phone number.
   * Protects against CPF-hopping abuse with the same device/phone.
   */
  private async checkRateLimitByPhone(
    phone: string,
    oneHourAgo: Date,
    cooldownThreshold: Date,
  ): Promise<void> {
    const lastOtpByPhone = await prisma.userOtp.findFirst({
      where: { user: { phone } },
      orderBy: { created_at: 'desc' },
      select: { created_at: true },
    });

    if (lastOtpByPhone && lastOtpByPhone.created_at > cooldownThreshold) {
      throw new RateLimitError(MSG_COOLDOWN);
    }

    const phoneRequestsLastHour = await prisma.userOtp.count({
      where: { user: { phone }, created_at: { gte: oneHourAgo } },
    });

    if (phoneRequestsLastHour >= OTP_MAX_PER_HOUR) {
      throw new RateLimitError(MSG_HOURLY_LIMIT);
    }
  }
}
