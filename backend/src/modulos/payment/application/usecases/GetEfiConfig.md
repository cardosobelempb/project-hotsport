import { prisma } from '../../lib/db.js';
import { type EfiConfigOutputDto,mapEfiConfig } from './efi-config-output.mapper.js';

export class GetEfiConfig {
  async execute(): Promise<EfiConfigOutputDto | null> {
    const config = await prisma.efiConfig.findFirst();
    if (!config) return null;

    return mapEfiConfig(config);
  }
}