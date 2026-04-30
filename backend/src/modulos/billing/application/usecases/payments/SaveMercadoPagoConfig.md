import { prisma } from "../../lib/db.js";
import {
  mapMercadoPagoConfig,
  type MercadoPagoConfigOutputDto,
} from "./mercadopago-config-output.mapper.js";

interface SaveMercadoPagoConfigInputDto {
  publicKey?: string | null;
  accessToken?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  webhookSecret?: string | null;
}

export class SaveMercadoPagoConfig {
  async execute(
    dto: SaveMercadoPagoConfigInputDto,
  ): Promise<MercadoPagoConfigOutputDto> {
    const existing = await prisma.configMercadoPago.findFirst();

    const config = existing
      ? await prisma.configMercadoPago.update({
          where: { id: existing.id },
          data: dto,
        })
      : await prisma.configMercadoPago.create({ data: dto });

    return mapMercadoPagoConfig(config);
  }
}

export type { SaveMercadoPagoConfigInputDto };
