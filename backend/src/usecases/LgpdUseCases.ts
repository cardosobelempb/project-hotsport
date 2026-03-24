import { prisma } from '../lib/db.js';

interface LgpdOutputDto {
  id: number;
  cpf: string;
  aceite: boolean;
  mac: string | null;
  ip: string | null;
  criado_em: string;
  nome: string | null;
  telefone: string | null;
}

function mapLgpd(l: {
  id: number;
  cpf: string;
  aceite: boolean;
  mac: string | null;
  ip: string | null;
  criado_em: Date;
  nome: string | null;
  telefone: string | null;
}): LgpdOutputDto {
  return {
    id: l.id,
    cpf: l.cpf,
    aceite: l.aceite,
    mac: l.mac,
    ip: l.ip,
    criado_em: l.criado_em.toISOString(),
    nome: l.nome,
    telefone: l.telefone,
  };
}

// ── RegisterLgpdConsent ───────────────────────────────────────────────────────

interface RegisterLgpdConsentInputDto {
  cpf: string;
  aceite: boolean;
  mac?: string;
  ip?: string;
  nome?: string;
  telefone?: string;
}

export class RegisterLgpdConsent {
  async execute(dto: RegisterLgpdConsentInputDto): Promise<LgpdOutputDto> {
    const record = await prisma.lgpdLogin.create({
      data: {
        cpf: dto.cpf,
        aceite: dto.aceite,
        mac: dto.mac ?? null,
        ip: dto.ip ?? null,
        nome: dto.nome ?? null,
        telefone: dto.telefone ?? null,
      },
    });
    return mapLgpd(record);
  }
}

// ── GetLgpdData ───────────────────────────────────────────────────────────────

export class GetLgpdData {
  async execute(): Promise<LgpdOutputDto[]> {
    const records = await prisma.lgpdLogin.findMany({ orderBy: { id: 'desc' } });
    return records.map(mapLgpd);
  }
}
