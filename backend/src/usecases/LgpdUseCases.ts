import { prisma } from "../lib/db.js";

interface LgpdOutputDto {
  id: string;
  cpf: string;
  accepted: boolean;
  macAddress: string | null;
  ipAddress: string | null;
  createdAt: string;
  name: string | null;
  phoneNumber: string | null;
}

function mapLgpd(l: {
  id: string;
  cpf: string;
  accepted: boolean;
  macAddress: string | null;
  ipAddress: string | null;
  createdAt: Date;
  name: string | null;
  phoneNumber: string | null;
}): LgpdOutputDto {
  return {
    id: l.id,
    cpf: l.cpf,
    accepted: l.accepted,
    macAddress: l.macAddress,
    ipAddress: l.ipAddress,
    createdAt: l.createdAt.toISOString(),
    name: l.name,
    phoneNumber: l.phoneNumber,
  };
}

// ── RegisterLgpdConsent ───────────────────────────────────────────────────────

interface RegisterLgpdConsentInputDto {
  cpf: string;
  accepted: boolean;
  macAddress?: string;
  ipAddress?: string;
  name?: string;
  phoneNumber?: string;
}

export class RegisterLgpdConsent {
  async execute(dto: RegisterLgpdConsentInputDto): Promise<LgpdOutputDto> {
    const record = await prisma.lgpdLogin.create({
      data: {
        cpf: dto.cpf,
        accepted: dto.accepted,
        macAddress: dto.macAddress ?? null,
        ipAddress: dto.ipAddress ?? null,
        name: dto.name ?? null,
        phoneNumber: dto.phoneNumber ?? null,
      },
    });
    return mapLgpd(record);
  }
}

// ── GetLgpdData ───────────────────────────────────────────────────────────────

export class GetLgpdData {
  async execute(): Promise<LgpdOutputDto[]> {
    const records = await prisma.lgpdLogin.findMany({
      orderBy: { id: "desc" },
    });
    return records.map(mapLgpd);
  }
}
