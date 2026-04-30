export interface GetPaymentsInputDto {
  page?: number;
  perPage?: number;
  filter?: string;
  sortBy?:
    | "id"
    | "planId"
    | "email"
    | "planName"
    | "amountCents"
    | "status"
    | "mercadoPagoId"
    | "createdAt"
    | "expiresAt"
    | "updatedAt"
    | "macAddress"
    | "cpf"
    | "ipAddress";
  sortDirection?: "asc" | "desc";
}
