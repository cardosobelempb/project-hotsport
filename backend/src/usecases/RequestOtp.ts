import axios from 'axios';
import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import dayjs from 'dayjs';

import { ConflictError, ValidationError, WhatsappError } from '../errors/index.js';
import { prisma } from '../lib/db.js';

// ── CPF validation ────────────────────────────────────────────────────────────

function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

function isValidCpf(cpf: string): boolean {
  const digits = normalizeCpf(cpf);

  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (len: number): number => {
    const remainder =
      (digits
        .slice(0, len)
        .split('')
        .reduce((sum, d, i) => sum + Number(d) * (len + 1 - i), 0) *
        10) %
      11;
    return remainder >= 10 ? 0 : remainder;
  };

  return calcDigit(9) === Number(digits[9]) && calcDigit(10) === Number(digits[10]);
}

// ── Phone normalization ───────────────────────────────────────────────────────

function normalizeTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return `55${digits}`;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

interface InputDto {
  cpf: string;
  telefone: string;
}

interface OutputDto {
  status: 'enviado' | 'erro';
  detail?: string;
}

// ── Use Case ─────────────────────────────────────────────────────────────────

export class RequestOtp {
  async execute({ cpf, telefone }: InputDto): Promise<OutputDto> {
    const cpfNormalizado = normalizeCpf(cpf);
    if (!isValidCpf(cpfNormalizado)) {
      throw new ValidationError('CPF inválido');
    }

    const telefoneNormalizado = normalizeTelefone(telefone);

    const recentOtp = await prisma.otpRequest.findFirst({
      where: {
        cpf: cpfNormalizado,
        used: false,
        expires_at: { gt: dayjs().toDate() },
        criado_em: { gt: dayjs().subtract(2, 'minute').toDate() },
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
}
