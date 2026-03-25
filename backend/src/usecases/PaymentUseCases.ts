import { NotFoundError } from '../errors/index.js';
import { prisma } from '../lib/db.js';

interface PaymentOutputDto {
  id: number;
  planId: number;
  email: string | null;
  planName: string | null;
  amount: number;
  status: string | null;
  mpPaymentId: number | null;
  createdAt: string;
  expiresAt: string | null;
  mac: string | null;
  cpf: string | null;
  ip: string | null;
}

function mapPayment(p: {
  id: number;
  planId: number;
  email: string | null;
  planName: string | null;
  amount: number;
  status: string | null;
  mpPaymentId: bigint | null;
  createdAt: Date;
  expiresAt: Date | null;
  mac: string | null;
  cpf: string | null;
  ip: string | null;
}): PaymentOutputDto {
  return {
    id: p.id,
    planId: p.planId,
    email: p.email,
    planName: p.planName,
    amount: p.amount,
    status: p.status,
    mpPaymentId: p.mpPaymentId !== null ? Number(p.mpPaymentId) : null,
    createdAt: p.createdAt.toISOString(),
    expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
    mac: p.mac,
    cpf: p.cpf,
    ip: p.ip,
  };
}

// ── GetPayments ───────────────────────────────────────────────────────────────

export class GetPayments {
  async execute(): Promise<PaymentOutputDto[]> {
    const payments = await prisma.payment.findMany({ orderBy: { id: 'desc' } });
    return payments.map(mapPayment);
  }
}

// ── ProcessPayment ────────────────────────────────────────────────────────────

interface ProcessPaymentInputDto {
  planId: number;
  email?: string | null;
  planName?: string | null;
  amount: number;
  status?: string | null;
  mpPaymentId?: number | null;
  expiresAt?: string | null;
  mac?: string | null;
  cpf?: string | null;
  ip?: string | null;
}

export class ProcessPayment {
  async execute(dto: ProcessPaymentInputDto): Promise<PaymentOutputDto> {
    const payment = await prisma.payment.create({
      data: {
        planId: dto.planId,
        email: dto.email ?? null,
        planName: dto.planName ?? null,
        amount: dto.amount,
        status: dto.status ?? null,
        mpPaymentId: dto.mpPaymentId ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        mac: dto.mac ?? null,
        cpf: dto.cpf ?? null,
        ip: dto.ip ?? null,
      },
    });
    return mapPayment(payment);
  }
}

// ── UpdatePaymentStatus ────────────────────────────────────────────────────────

interface UpdatePaymentStatusInputDto {
  id: number;
  status: string;
}

export class UpdatePaymentStatus {
  async execute({ id, status }: UpdatePaymentStatusInputDto): Promise<PaymentOutputDto> {
    const exists = await prisma.payment.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Payment not found');
    const payment = await prisma.payment.update({ where: { id }, data: { status } });
    return mapPayment(payment);
  }
}
