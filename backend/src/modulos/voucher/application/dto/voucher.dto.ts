interface VoucherDto {
  organizationId: string;
  planId: string;
  code: string;
  status: string;
  mikrotikId: string;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface VoucherRawDto extends Omit<
  VoucherDto,
  "createdAt" | "updatedAt" | "status" | "usedAt" | "expiresAt" | "deletedAt"
> {
  id: string;
  organizationId: string;
  planId: string;
  code: string;
  mikrotikId: string;
}

export interface VoucherInputDto extends Omit<
  VoucherDto,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "usedAt"
  | "expiresAt"
  | "deletedAt"
> {
  organizationId: string;
  planId: string;
  code: string;
  mikrotikId: string;
}

export interface VoucherOutputDto extends Omit<
  VoucherDto,
  "updatedAt" | "deletedAt"
> {
  id: string;
  organizationId: string;
  planId: string;
  code: string;
  status: string;
  mikrotikId: string;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface VoucherOptionalDto extends Partial<VoucherDto> {}
