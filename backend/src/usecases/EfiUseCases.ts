import { prisma } from '../lib/db.js';

interface EfiConfigOutputDto {
  id: number;
  client_id: string;
  client_secret: string;
  chave_pix: string;
  ambiente: 'sandbox' | 'producao';
  certificado_nome: string | null;
}

function mapEfiConfig(e: {
  id: number;
  client_id: string;
  client_secret: string;
  chave_pix: string;
  ambiente: 'sandbox' | 'producao';
  certificado_nome: string | null;
}): EfiConfigOutputDto {
  return {
    id: e.id,
    client_id: e.client_id,
    client_secret: e.client_secret,
    chave_pix: e.chave_pix,
    ambiente: e.ambiente,
    certificado_nome: e.certificado_nome,
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
  client_id: string;
  client_secret: string;
  chave_pix: string;
  ambiente: 'sandbox' | 'producao';
  certificado_nome?: string;
}

export class SaveEfiConfig {
  async execute(dto: SaveEfiConfigInputDto): Promise<EfiConfigOutputDto> {
    const existing = await prisma.efiConfig.findFirst();

    const data = {
      client_id: dto.client_id,
      client_secret: dto.client_secret,
      chave_pix: dto.chave_pix,
      ambiente: dto.ambiente,
      certificado_nome: dto.certificado_nome ?? null,
    };

    const config = existing
      ? await prisma.efiConfig.update({ where: { id: existing.id }, data })
      : await prisma.efiConfig.create({ data });

    return mapEfiConfig(config);
  }
}
