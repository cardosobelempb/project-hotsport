import { z } from 'zod';

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const LoginSchema = z.object({
  email: z.email(),
  senha: z.string().min(1),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
});

export const PlanoSchema = z.object({
  id: z.number().int(),
  nome: z.string(),
  descricao: z.string().nullable(),
  valor: z.number(),
  duracao_minutos: z.number().int(),
  velocidade_down: z.string(),
  velocidade_up: z.string(),
  mikrotik_id: z.number().int(),
  ativo: z.number().int(),
  address_pool: z.string(),
  shared_users: z.number().int(),
});

export const PlanoCreateSchema = PlanoSchema.omit({ id: true });

export const MikrotikSchema = z.object({
  id: z.number().int(),
  nome: z.string(),
  ip: z.string(),
  usuario: z.string(),
  senha: z.string(),
  porta: z.number().int(),
  status: z.string(),
  usuarios_ativos: z.number().int(),
  end_hotspot: z.string().nullable(),
});

export const MikrotikCreateSchema = MikrotikSchema.omit({ id: true, status: true, usuarios_ativos: true });

export const PagamentoSchema = z.object({
  id: z.number().int(),
  plano_id: z.number().int(),
  email: z.string().nullable(),
  nome_plano: z.string().nullable(),
  valor: z.number().int(),
  status: z.string().nullable(),
  mp_pagamento_id: z.number().nullable(),
  criado_em: z.string().nullable(),
  expira_em: z.string().nullable(),
  mac: z.string().nullable(),
  cpf: z.string().nullable(),
  IP: z.string().nullable(),
});

export const RadiusUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  plano_id: z.number().int().nullable(),
  nas_id: z.number().int().nullable(),
  criado_em: z.string().nullable(),
});

export const DashboardSchema = z.object({
  total_planos: z.number().int(),
  total_pagamentos: z.number().int(),
  total_mikrotiks: z.number().int(),
  total_usuarios_radius: z.number().int(),
});

export const LgpdLoginSchema = z.object({
  id: z.number().int(),
  cpf: z.string(),
  aceite: z.number().int(),
  mac: z.string().nullable(),
  ip: z.string().nullable(),
  nome: z.string().nullable(),
  telefone: z.string().nullable(),
  criado_em: z.string().nullable(),
});

export const WhatsappStatusSchema = z.object({
  status: z.string(),
  message: z.string().optional(),
});

export const ConfigMercadoPagoSchema = z.object({
  id: z.number().int(),
  public_key: z.string().nullable(),
  access_token: z.string().nullable(),
  client_id: z.string().nullable(),
  client_secret: z.string().nullable(),
  webhook_secret: z.string().nullable(),
});

export const LimpezaResponseSchema = z.object({
  message: z.string(),
  affected: z.number().int().optional(),
});

export const MessageSchema = z.object({
  message: z.string(),
});
