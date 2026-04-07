import { UUIDVO } from "@/core";

export interface PaymentProps {
  id: UUIDVO;
  planId: string;
  email: string | null;
  planName: string | null;
  amountCents: number;
  status: string | null;
  mercadoPagoId: string | null;
  macAddress: string | null;
  cpf: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date | null;
  updatedAt: Date;
}
