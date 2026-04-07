export interface LgpdOutputDto {
  id: number;
  cpf: string;
  consent: boolean;
  mac: string | null;
  ip: string | null;
  createdAt: string;
  name: string | null;
  phone: string | null;
}

interface LgpdMapperInput {
  id: number;
  cpf: string;
  consent: boolean;
  mac: string | null;
  ip: string | null;
  createdAt: Date;
  name: string | null;
  phone: string | null;
}

export const mapLgpd = (record: LgpdMapperInput): LgpdOutputDto => ({
  id: record.id,
  cpf: record.cpf,
  consent: record.consent,
  mac: record.mac,
  ip: record.ip,
  createdAt: record.createdAt.toISOString(),
  name: record.name,
  phone: record.phone,
});
