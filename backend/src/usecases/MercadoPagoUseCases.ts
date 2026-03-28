import { prisma } from "../lib/db.js";

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
    const config = await prisma.mercadoPagoConfig.findFirst();
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
  async execute(
    dto: SaveMercadoPagoConfigInputDto,
  ): Promise<MercadoPagoConfigOutputDto> {
    const existing = await prisma.mercadoPagoConfig.findFirst();

    const config = existing
      ? await prisma.mercadoPagoConfig.update({
          where: { id: existing.id },
          data: dto,
        })
      : await prisma.mercadoPagoConfig.create({ data: dto });

    return mapConfig(config);
  }
}
