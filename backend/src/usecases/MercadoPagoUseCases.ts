import { prisma } from '../lib/db.js';

interface MercadoPagoConfigOutputDto {
  id: number;
  public_key: string | null;
  access_token: string | null;
  client_id: string | null;
  client_secret: string | null;
  webhook_secret: string | null;
}

function mapConfig(c: {
  id: number;
  public_key: string | null;
  access_token: string | null;
  client_id: string | null;
  client_secret: string | null;
  webhook_secret: string | null;
}): MercadoPagoConfigOutputDto {
  return {
    id: c.id,
    public_key: c.public_key,
    access_token: c.access_token,
    client_id: c.client_id,
    client_secret: c.client_secret,
    webhook_secret: c.webhook_secret,
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
  public_key?: string | null;
  access_token?: string | null;
  client_id?: string | null;
  client_secret?: string | null;
  webhook_secret?: string | null;
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
