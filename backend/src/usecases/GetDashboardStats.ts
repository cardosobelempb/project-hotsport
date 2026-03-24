import { prisma } from '../lib/db.js';

interface DashboardStatsOutputDto {
  total_planos: number;
  total_mikrotiks: number;
  total_pagamentos: number;
  total_radius_users: number;
  pagamentos_aprovados: number;
  receita_total: number;
}

export class GetDashboardStats {
  async execute(): Promise<DashboardStatsOutputDto> {
    const [
      total_planos,
      total_mikrotiks,
      total_pagamentos,
      total_radius_users,
      pagamentos_aprovados,
      receitaAggregate,
    ] = await Promise.all([
      prisma.plano.count(),
      prisma.mikrotik.count(),
      prisma.pagamento.count(),
      prisma.radiusUser.count(),
      prisma.pagamento.count({ where: { status: 'approved' } }),
      prisma.pagamento.aggregate({
        _sum: { valor: true },
        where: { status: 'approved' },
      }),
    ]);

    return {
      total_planos,
      total_mikrotiks,
      total_pagamentos,
      total_radius_users,
      pagamentos_aprovados,
      receita_total: receitaAggregate._sum.valor ?? 0,
    };
  }
}
