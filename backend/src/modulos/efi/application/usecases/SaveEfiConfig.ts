import { prisma } from '../../lib/db.js';
import { type EfiConfigOutputDto,mapEfiConfig } from './efi-config-output.mapper.js';

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

export type { SaveEfiConfigInputDto };