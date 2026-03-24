import { z } from 'zod';

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

// Auth
export const LoginSchema = z.object({
  email: z.email(),
  senha: z.string().min(1),
});

export const LoginOutputSchema = z.object({
  token: z.string(),
});

// Admin
export const AdminSchema = z.object({
  id: z.number().int(),
  email: z.email(),
  created_at: z.string(),
});

// Plano
export const PlanoSchema = z.object({
  id: z.number().int(),
  nome: z.string(),
  descricao: z.string().nullable(),
  valor: z.number(),
  duracao_minutos: z.number().int(),
  velocidade_down: z.string(),
  velocidade_up: z.string(),
  mikrotik_id: z.number().int(),
  ativo: z.boolean(),
  address_pool: z.string(),
  shared_users: z.number().int(),
});

export const CreatePlanoSchema = PlanoSchema.omit({ id: true });
export const UpdatePlanoSchema = PlanoSchema.omit({ id: true }).partial();

// Mikrotik
export const MikrotikSchema = z.object({
  id: z.number().int(),
  nome: z.string(),
  ip: z.string(),
  usuario: z.string(),
  senha: z.string(),
  porta: z.number().int(),
  status: z.string(),
  usuarios_ativos: z.number().int(),
  criado_em: z.string(),
  end_hotspot: z.string().nullable(),
});

export const CreateMikrotikSchema = MikrotikSchema.omit({ id: true, status: true, usuarios_ativos: true, criado_em: true });
export const UpdateMikrotikSchema = CreateMikrotikSchema.partial();

// Pagamento
export const PagamentoSchema = z.object({
  id: z.number().int(),
  plano_id: z.number().int(),
  email: z.string().nullable(),
  nome_plano: z.string().nullable(),
  valor: z.number().int(),
  status: z.string().nullable(),
  mp_pagamento_id: z.number().nullable(),
  criado_em: z.string(),
  expira_em: z.string().nullable(),
  mac: z.string().nullable(),
  cpf: z.string().nullable(),
  IP: z.string().nullable(),
});

export const CreatePagamentoSchema = PagamentoSchema.omit({ id: true, criado_em: true });

// Radius
export const RadiusUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  plano_id: z.number().int().nullable(),
  nas_id: z.number().int().nullable(),
  criado_em: z.string(),
});

export const CreateRadiusUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  plano_id: z.number().int().optional(),
  nas_id: z.number().int().optional(),
});

// Dashboard
export const DashboardStatsSchema = z.object({
  total_planos: z.number().int(),
  total_mikrotiks: z.number().int(),
  total_pagamentos: z.number().int(),
  total_radius_users: z.number().int(),
  pagamentos_aprovados: z.number().int(),
  receita_total: z.number(),
});

// LGPD
export const LgpdLoginSchema = z.object({
  id: z.number().int(),
  cpf: z.string(),
  aceite: z.boolean(),
  mac: z.string().nullable(),
  ip: z.string().nullable(),
  criado_em: z.string(),
  nome: z.string().nullable(),
  telefone: z.string().nullable(),
});

export const RegisterLgpdSchema = z.object({
  cpf: z.string().min(11).max(14),
  aceite: z.boolean(),
  mac: z.string().optional(),
  ip: z.string().optional(),
  nome: z.string().optional(),
  telefone: z.string().optional(),
});

// EfiConfig
export const EfiConfigSchema = z.object({
  id: z.number().int(),
  client_id: z.string(),
  client_secret: z.string(),
  chave_pix: z.string(),
  ambiente: z.enum(['sandbox', 'producao']),
  certificado_nome: z.string().nullable(),
});

export const SaveEfiConfigSchema = EfiConfigSchema.omit({ id: true, certificado_nome: true }).extend({
  certificado_nome: z.string().optional(),
});

// ConfigMercadoPago
export const ConfigMercadoPagoSchema = z.object({
  id: z.number().int(),
  public_key: z.string().nullable(),
  access_token: z.string().nullable(),
  client_id: z.string().nullable(),
  client_secret: z.string().nullable(),
  webhook_secret: z.string().nullable(),
});

export const SaveMercadoPagoConfigSchema = ConfigMercadoPagoSchema.omit({ id: true }).partial();
