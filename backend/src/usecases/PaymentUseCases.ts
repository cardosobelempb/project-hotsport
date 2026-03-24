import { NotFoundError } from '../errors/index.js';
import { prisma } from '../lib/db.js';

interface PagamentoOutputDto {
  id: number;
  plano_id: number;
  email: string | null;
  nome_plano: string | null;
  valor: number;
  status: string | null;
  mp_pagamento_id: number | null;
  criado_em: string;
  expira_em: string | null;
  mac: string | null;
  cpf: string | null;
  IP: string | null;
}

function mapPagamento(p: {
  id: number;
  plano_id: number;
  email: string | null;
  nome_plano: string | null;
  valor: number;
  status: string | null;
  mp_pagamento_id: bigint | null;
  criado_em: Date;
  expira_em: Date | null;
  mac: string | null;
  cpf: string | null;
  IP: string | null;
}): PagamentoOutputDto {
  return {
    id: p.id,
    plano_id: p.plano_id,
    email: p.email,
    nome_plano: p.nome_plano,
    valor: p.valor,
    status: p.status,
    mp_pagamento_id: p.mp_pagamento_id !== null ? Number(p.mp_pagamento_id) : null,
    criado_em: p.criado_em.toISOString(),
    expira_em: p.expira_em ? p.expira_em.toISOString() : null,
    mac: p.mac,
    cpf: p.cpf,
    IP: p.IP,
  };
}

// ── GetPayments ───────────────────────────────────────────────────────────────

export class GetPayments {
  async execute(): Promise<PagamentoOutputDto[]> {
    const pagamentos = await prisma.pagamento.findMany({ orderBy: { id: 'desc' } });
    return pagamentos.map(mapPagamento);
  }
}

// ── ProcessPayment ────────────────────────────────────────────────────────────

interface ProcessPaymentInputDto {
  plano_id: number;
  email?: string | null;
  nome_plano?: string | null;
  valor: number;
  status?: string | null;
  mp_pagamento_id?: number | null;
  expira_em?: string | null;
  mac?: string | null;
  cpf?: string | null;
  IP?: string | null;
}

export class ProcessPayment {
  async execute(dto: ProcessPaymentInputDto): Promise<PagamentoOutputDto> {
    const pagamento = await prisma.pagamento.create({
      data: {
        plano_id: dto.plano_id,
        email: dto.email ?? null,
        nome_plano: dto.nome_plano ?? null,
        valor: dto.valor,
        status: dto.status ?? null,
        mp_pagamento_id: dto.mp_pagamento_id ?? null,
        expira_em: dto.expira_em ? new Date(dto.expira_em) : null,
        mac: dto.mac ?? null,
        cpf: dto.cpf ?? null,
        IP: dto.IP ?? null,
      },
    });
    return mapPagamento(pagamento);
  }
}

// ── UpdatePaymentStatus ────────────────────────────────────────────────────────

interface UpdatePaymentStatusInputDto {
  id: number;
  status: string;
}

export class UpdatePaymentStatus {
  async execute({ id, status }: UpdatePaymentStatusInputDto): Promise<PagamentoOutputDto> {
    const exists = await prisma.pagamento.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Pagamento não encontrado');
    const pagamento = await prisma.pagamento.update({ where: { id }, data: { status } });
    return mapPagamento(pagamento);
  }
}
