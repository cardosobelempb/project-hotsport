import { prisma } from '../lib/db.js';

interface MercadoPagoConfigOutputDto {
  id: number;
  publicKey: string | null;
  accessToken: string | null;
  clientId: string | null;
  clientSecret: string | null;
  webhookSecret: string | null;
}

function mapConfig(c: {
  id: number;
  publicKey: string | null;
  accessToken: string | null;
  clientId: string | null;
  clientSecret: string | null;
  webhookSecret: string | null;
}): MercadoPagoConfigOutputDto {
  return {
    id: c.id,
    publicKey: c.publicKey,
    accessToken: c.accessToken,
    clientId: c.clientId,
    clientSecret: c.clientSecret,
    webhookSecret: c.webhookSecret,
  };
}

// ── GetMercadoPagoConfig ──────────────────────────────────────────────────────

export class GetMercadoPagoConfig {
  async execute(): Promise<MercadoPagoConfigOutputDto | null> {
    const config = await prisma.configMercadoPago.findFirst();
    if (!config) return null;
    return mapConfig(config);
  }
}

// ── SaveMercadoPagoConfig ─────────────────────────────────────────────────────

interface SaveMercadoPagoConfigInputDto {
  publicKey?: string | null;
  accessToken?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  webhookSecret?: string | null;
}

export class SaveMercadoPagoConfig {
  async execute(dto: SaveMercadoPagoConfigInputDto): Promise<MercadoPagoConfigOutputDto> {
    const existing = await prisma.configMercadoPago.findFirst();

    const config = existing
      ? await prisma.configMercadoPago.update({ where: { id: existing.id }, data: dto })
      : await prisma.configMercadoPago.create({ data: dto });

    return mapConfig(config);
  }
}
