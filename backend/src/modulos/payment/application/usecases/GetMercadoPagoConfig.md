import { prisma } from "../../lib/db.js";
import {
  mapMercadoPagoConfig,
  type MercadoPagoConfigOutputDto,
} from "./mercadopago-config-output.mapper.js";

export class GetMercadoPagoConfig {
  async execute(): Promise<MercadoPagoConfigOutputDto | null> {
    const config = await prisma.configMercadoPago.findFirst();
    if (!config) return null;

    return mapMercadoPagoConfig(config);
  }
}
