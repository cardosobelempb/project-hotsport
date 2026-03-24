interface InputDto {
  _?: never;
}

interface OutputDto {
  total_clientes: number;
  planos_ativos: number;
  receita_mensal: number;
  conexoes_ativas: number;
  pagamentos_pendentes: number;
}

export class GetDashboardStats {
  async execute(_dto: InputDto = {}): Promise<OutputDto> {
    return {
      total_clientes: 0,
      planos_ativos: 0,
      receita_mensal: 0,
      conexoes_ativas: 0,
      pagamentos_pendentes: 0,
    };
  }
}
