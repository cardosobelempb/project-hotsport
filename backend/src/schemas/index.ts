import { z } from 'zod';

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const LoginSchema = z.object({
  email: z.email(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
});

export const PlanoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  valor: z.number().positive('Valor deve ser positivo'),
  duracao_dias: z.number().int().positive('Duração deve ser positiva'),
  velocidade_download: z.string().min(1, 'Velocidade de download é obrigatória'),
  velocidade_upload: z.string().min(1, 'Velocidade de upload é obrigatória'),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
});

export const PlanoListSchema = z.array(PlanoSchema);

export const MikrotikSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  ip: z.ipv4(),
  porta: z.number().int().min(1).max(65535).default(8728),
  ativo: z.boolean().optional(),
});

export const MikrotikListSchema = z.array(MikrotikSchema);

export const PagamentoSchema = z.object({
  id: z.string().optional(),
  mac: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'MAC inválido'),
  ip: z.ipv4(),
  plano_id: z.string().min(1, 'Plano é obrigatório'),
  nome: z.string().optional(),
  telefone: z.string().optional(),
  email: z.email().optional(),
  valor: z.number().positive().optional(),
  status: z.enum(['pendente', 'aprovado', 'cancelado']).optional(),
  criado_em: z.iso.datetime().optional(),
});

export const PagamentoListSchema = z.array(PagamentoSchema);

export const RadiusSchema = z.object({
  usuario: z.string().min(1, 'Usuário é obrigatório'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  plano_id: z.string().optional(),
  expiracao: z.iso.datetime().optional(),
});

export const LgpdSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos numéricos'),
  mac: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'MAC inválido'),
  ip: z.ipv4(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  aceito_em: z.iso.datetime().optional(),
});

export const ConfigMercadoPagoSchema = z.object({
  public_key: z.string().min(1, 'Public key é obrigatória'),
  access_token: z.string().min(1, 'Access token é obrigatório'),
  webhook_url: z.url().optional(),
});

export const ConfigMercadoPagoResponseSchema = z.object({
  id: z.string(),
  public_key: z.string(),
  access_token: z.string(),
  webhook_url: z.url().optional(),
  configurado_em: z.iso.datetime(),
});

export const EfiSchema = z.object({
  client_id: z.string().min(1, 'Client ID é obrigatório'),
  client_secret: z.string().min(1, 'Client Secret é obrigatório'),
  sandbox: z.boolean().default(false),
  webhook_url: z.url().optional(),
});

export const DashboardStatsSchema = z.object({
  total_clientes: z.number().int(),
  planos_ativos: z.number().int(),
  receita_mensal: z.number(),
  conexoes_ativas: z.number().int(),
  pagamentos_pendentes: z.number().int(),
});

export const ParamsIdSchema = z.object({
  id: z.string().min(1),
});

export const WhatsappSendSchema = z.object({
  telefone: z.string().min(10, 'Telefone inválido'),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
});

export const StatusSchema = z.object({
  ok: z.boolean(),
});
