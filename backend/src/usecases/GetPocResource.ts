import { NotFoundError } from '../errors/index.js';

interface InputDto {
  id: string;
}

interface OutputDto {
  id: string;
  nome: string;
}

export class GetPocResource {
  async execute({ id }: InputDto): Promise<OutputDto> {
    const recursos: Record<string, OutputDto> = {
      '1': { id: '1', nome: 'Recurso de exemplo' },
    };

    const recurso = recursos[id];
    if (!recurso) {
      throw new NotFoundError(`Recurso com id "${id}" não encontrado`);
    }

    return recurso;
  }
}
