import { prisma } from '../lib/db.js';

interface EfiConfigOutputDto {
  id: number;
  clientId: string;
  clientSecret: string;
  pixKey: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  certificateName: string | null;
}

function mapEfiConfig(e: {
  id: number;
  clientId: string;
  clientSecret: string;
  pixKey: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  certificateName: string | null;
}): EfiConfigOutputDto {
  return {
    id: e.id,
    clientId: e.clientId,
    clientSecret: e.clientSecret,
    pixKey: e.pixKey,
    environment: e.environment,
    certificateName: e.certificateName,
  };
}

// ── GetEfiConfig ──────────────────────────────────────────────────────────────

export class GetEfiConfig {
  async execute(): Promise<EfiConfigOutputDto | null> {
    const config = await prisma.efiConfig.findFirst();
    if (!config) return null;
    return mapEfiConfig(config);
  }
}

// ── SaveEfiConfig ─────────────────────────────────────────────────────────────

interface SaveEfiConfigInputDto {
  clientId: string;
  clientSecret: string;
  pixKey: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  certificateName?: string;
}

export class SaveEfiConfig {
  async execute(dto: SaveEfiConfigInputDto): Promise<EfiConfigOutputDto> {
    const existing = await prisma.efiConfig.findFirst();

    const data = {
      clientId: dto.clientId,
      clientSecret: dto.clientSecret,
      pixKey: dto.pixKey,
      environment: dto.environment,
      certificateName: dto.certificateName ?? null,
    };

    const config = existing
      ? await prisma.efiConfig.update({ where: { id: existing.id }, data })
      : await prisma.efiConfig.create({ data });

    return mapEfiConfig(config);
  }
}
