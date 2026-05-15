export interface EfiConfigOutputDto {
  id: number;
  clientId: string;
  clientSecret: string;
  pixKey: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  certificateName: string | null;
}

interface EfiConfigMapperInput {
  id: number;
  clientId: string;
  clientSecret: string;
  pixKey: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  certificateName: string | null;
}

export const mapEfiConfig = (config: EfiConfigMapperInput): EfiConfigOutputDto => ({
  id: config.id,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  pixKey: config.pixKey,
  environment: config.environment,
  certificateName: config.certificateName,
});