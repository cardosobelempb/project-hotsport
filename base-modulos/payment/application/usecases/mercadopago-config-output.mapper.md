export interface MercadoPagoConfigOutputDto {
  id: number;
  publicKey: string | null;
  accessToken: string | null;
  clientId: string | null;
  clientSecret: string | null;
  webhookSecret: string | null;
}

interface MercadoPagoConfigMapperInput {
  id: number;
  publicKey: string | null;
  accessToken: string | null;
  clientId: string | null;
  clientSecret: string | null;
  webhookSecret: string | null;
}

export const mapMercadoPagoConfig = (
  config: MercadoPagoConfigMapperInput,
): MercadoPagoConfigOutputDto => ({
  id: config.id,
  publicKey: config.publicKey,
  accessToken: config.accessToken,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  webhookSecret: config.webhookSecret,
});
