interface InputDto {
  _?: never;
}

interface OutputDto {
  ok: boolean;
}

export class GetStatus {
  async execute(_dto: InputDto = {}): Promise<OutputDto> {
    return { ok: true };
  }
}
