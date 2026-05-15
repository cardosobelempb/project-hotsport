// DTO de saída — representa um pagamento já serializado (datas como string ISO)
// Nunca retorne o model do Prisma diretamente para o cliente
export interface PaymentOutputDto {
  id: string;
  planId: string;
  email: string | null;
  planName: string | null;
  amountCents: number;
  status: string | null;
  mercadoPagoId: string | null;
  createdAt: string;
  expiresAt: string | null;
  updatedAt: string;
  macAddress: string | null;
  cpf: string | null;
  ipAddress: string | null;
}
