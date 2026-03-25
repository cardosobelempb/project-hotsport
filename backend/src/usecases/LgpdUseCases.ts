import { prisma } from '../lib/db.js';

interface LgpdOutputDto {
  id: number;
  cpf: string;
  consent: boolean;
  mac: string | null;
  ip: string | null;
  createdAt: string;
  name: string | null;
  phone: string | null;
}

function mapLgpd(l: {
  id: number;
  cpf: string;
  consent: boolean;
  mac: string | null;
  ip: string | null;
  createdAt: Date;
  name: string | null;
  phone: string | null;
}): LgpdOutputDto {
  return {
    id: l.id,
    cpf: l.cpf,
    consent: l.consent,
    mac: l.mac,
    ip: l.ip,
    createdAt: l.createdAt.toISOString(),
    name: l.name,
    phone: l.phone,
  };
}

// ── RegisterLgpdConsent ───────────────────────────────────────────────────────

interface RegisterLgpdConsentInputDto {
  cpf: string;
  consent: boolean;
  mac?: string;
  ip?: string;
  name?: string;
  phone?: string;
}

export class RegisterLgpdConsent {
  async execute(dto: RegisterLgpdConsentInputDto): Promise<LgpdOutputDto> {
    const record = await prisma.lgpdLogin.create({
      data: {
        cpf: dto.cpf,
        consent: dto.consent,
        mac: dto.mac ?? null,
        ip: dto.ip ?? null,
        name: dto.name ?? null,
        phone: dto.phone ?? null,
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
