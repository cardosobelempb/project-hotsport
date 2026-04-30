// DTO de entrada para criação de pagamento
// Campos opcionais com null explícito — deixa o contrato claro para o caller
export interface ProcessPaymentInputDto {
  planId: string;
  email?: string | null;
  planName?: string | null;
  amountCents: number;
  status?: string | null;
  mercadoPagoId?: string | null;
  expiresAt?: string | null;
  macAddress?: string | null;
  cpf?: string | null;
  ipAddress?: string | null;
}
