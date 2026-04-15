export interface PaymentOutputDto {
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

interface PaymentMapperInput {
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
}

export const mapPayment = (payment: PaymentMapperInput): PaymentOutputDto => ({
  id: payment.id,
  planId: payment.planId,
  email: payment.email,
  planName: payment.planName,
  amount: payment.amount,
  status: payment.status,
  mpPaymentId:
    payment.mpPaymentId !== null ? Number(payment.mpPaymentId) : null,
  createdAt: payment.createdAt.toISOString(),
  expiresAt: payment.expiresAt ? payment.expiresAt.toISOString() : null,
  mac: payment.mac,
  cpf: payment.cpf,
  ip: payment.ip,
});
