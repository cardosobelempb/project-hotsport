import { z } from 'zod';

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

// Auth
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const LoginOutputSchema = z.object({
  token: z.string(),
});

export const JwtMeOutputSchema = z.object({
  sub: z.string(),
  role: z.string().optional(),
});

// Admin
export const AdminSchema = z.object({
  id: z.number().int(),
  email: z.email(),
  createdAt: z.string(),
});

// Plan
export const PlanoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  amount: z.number(),
  durationMinutes: z.number().int(),
  downloadSpeed: z.string(),
  uploadSpeed: z.string(),
  mikrotikId: z.number().int(),
  active: z.boolean(),
  addressPool: z.string(),
  sharedUsers: z.number().int(),
});

export const CreatePlanoSchema = PlanoSchema.omit({ id: true });
export const UpdatePlanoSchema = PlanoSchema.omit({ id: true }).partial();

// Mikrotik
export const MikrotikSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  ip: z.string(),
  username: z.string(),
  password: z.string(),
  port: z.number().int(),
  status: z.string(),
  activeUsers: z.number().int(),
  createdAt: z.string(),
  hotspotAddress: z.string().nullable(),
});

export const CreateMikrotikSchema = MikrotikSchema.omit({ id: true, status: true, activeUsers: true, createdAt: true });
export const UpdateMikrotikSchema = CreateMikrotikSchema.partial();

// Payment
export const PagamentoSchema = z.object({
  id: z.number().int(),
  planId: z.number().int(),
  email: z.string().nullable(),
  planName: z.string().nullable(),
  amount: z.number().int(),
  status: z.string().nullable(),
  mpPaymentId: z.number().nullable(),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  mac: z.string().nullable(),
  cpf: z.string().nullable(),
  ip: z.string().nullable(),
});

export const CreatePagamentoSchema = PagamentoSchema.omit({ id: true, createdAt: true });

// Radius
export const RadiusUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  planId: z.number().int().nullable(),
  nasId: z.number().int().nullable(),
  createdAt: z.string(),
});

export const CreateRadiusUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  planId: z.number().int().optional(),
  nasId: z.number().int().optional(),
});

// Dashboard
export const DashboardStatsSchema = z.object({
  totalPlans: z.number().int(),
  totalMikrotiks: z.number().int(),
  totalPayments: z.number().int(),
  totalRadiusUsers: z.number().int(),
  approvedPayments: z.number().int(),
  totalRevenue: z.number(),
});

// LGPD
export const LgpdLoginSchema = z.object({
  id: z.number().int(),
  cpf: z.string(),
  consent: z.boolean(),
  mac: z.string().nullable(),
  ip: z.string().nullable(),
  createdAt: z.string(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
});

export const RegisterLgpdSchema = z.object({
  cpf: z.string().min(11).max(14),
  consent: z.boolean(),
  mac: z.string().optional(),
  ip: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
});

// EfiConfig
export const EfiConfigSchema = z.object({
  id: z.number().int(),
  clientId: z.string(),
  clientSecret: z.string(),
  pixKey: z.string(),
  environment: z.enum(['SANDBOX', 'PRODUCTION']),
  certificateName: z.string().nullable(),
});

export const SaveEfiConfigSchema = EfiConfigSchema.omit({ id: true, certificateName: true }).extend({
  certificateName: z.string().optional(),
});

// ConfigMercadoPago
export const ConfigMercadoPagoSchema = z.object({
  id: z.number().int(),
  publicKey: z.string().nullable(),
  accessToken: z.string().nullable(),
  clientId: z.string().nullable(),
  clientSecret: z.string().nullable(),
  webhookSecret: z.string().nullable(),
});

export const SaveMercadoPagoConfigSchema = ConfigMercadoPagoSchema.omit({ id: true }).partial();

// Generic
export const MessageSchema = z.object({
  message: z.string(),
});

export const ParamsIdSchema = z.object({
  id: z.string(),
});

// Limpeza
export const LimpezaResponseSchema = z.object({
  message: z.string(),
  affected: z.number().int(),
});

// Status
export const StatusSchema = z.object({
  ok: z.boolean(),
});

// WhatsApp
export const WhatsappStatusSchema = z.object({
  status: z.string(),
  message: z.string().optional(),
});

// OTP
export const OtpRequestBodySchema = z.object({
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF deve ter 11 dígitos'),
  phone: z.string().regex(/^\+?[\d\s\-().]{10,20}$/, 'Telefone inválido'),
});

export const OtpRequestResponseSchema = z.object({
  status: z.enum(['enviado', 'erro']),
  detail: z.string().optional(),
});

// UserOtp
export const UserOtpSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  expires_at: z.iso.datetime(),
  attempts: z.number().int(),
  used: z.boolean(),
  created_at: z.iso.datetime(),
});

// OTP request/verify
export const RequestOtpSchema = z.object({
  cpf: z.string().min(11).max(14),
  phone: z.string().min(10).max(20),
  name: z.string().optional(),
});

export const VerifyOtpSchema = z.object({
  cpf: z.string().min(11).max(14),
  otp: z.string().length(6),
});

export const VerifyOtpOutputSchema = z.object({
  verified: z.boolean(),
  userId: z.uuid(),
  cpf: z.string(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  nextStep: z.enum(['login', 'register', 'entitlement']),
});

// OTP audit events
export const OtpAuditEventSchema = z.enum([
  'otp_requested',
  'otp_sent',
  'otp_whatsapp_error',
  'otp_throttled',
  'otp_validation_error',
  'otp_request_error',
  'otp_verify_attempt',
  'otp_verified',
  'otp_invalid',
  'otp_max_attempts',
  'otp_not_found',
  'otp_user_not_found',
]);

export const OtpAuditLogSchema = z.object({
  id: z.number().int(),
  event: OtpAuditEventSchema,
  cpf: z.string(),
  phone: z.string().nullable(),
  ip: z.string().nullable(),
  detail: z.string().nullable(),
  createdAt: z.iso.datetime(),
});

// Aliases for backward compatibility
export const PagamentoListSchema = z.array(PagamentoSchema);
export const PlanoCreateSchema = PlanoSchema.omit({ id: true });
