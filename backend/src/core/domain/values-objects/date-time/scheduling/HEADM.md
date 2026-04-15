### 🎯 Diferença chave entre Birth e Scheduled

- Birth: deve estar no passado, com idade entre 0 e 130 anos.
- Scheduled: deve estar no futuro (ou no mínimo no presente), dentro de um intervalo permitido (ex: até 1 ano no futuro).

### 🧱 1. Classe abstrata: AbstractScheduledDate

```
export abstract class AbstractScheduledDate {
  protected abstract date: unknown;

  /** Retorna a data no formato YYYY-MM-DD HH:mm */
  abstract toString(): string;

  /** Retorna o valor bruto da data (Date, Dayjs, etc.) */
  abstract getValue(): unknown;

  /** Verifica se a data está dentro de um intervalo de agendamento permitido */
  abstract isValid(): boolean;

  /** Validações genéricas: data deve ser futura mas não muito distante */
  protected isValidSchedule(dateTimestamp: number, now: number): boolean {
    const oneYearAhead = now + 1000 * 60 * 60 * 24 * 365;
    return dateTimestamp >= now && dateTimestamp <= oneYearAhead;
  }
}

```

### 📦 2. Implementação com dayjs: DayjsScheduledDate

```
import dayjs, { Dayjs } from 'dayjs';
import { AbstractScheduledDate } from './AbstractScheduledDate';

export class DayjsScheduledDate extends AbstractScheduledDate {
  protected date: Dayjs;

  constructor(input: string | Date | Dayjs) {
    super();
    const parsed = dayjs(input);

    if (!parsed.isValid()) {
      throw new Error('Data de agendamento inválida.');
    }

    const now = dayjs();
    if (!super.isValidSchedule(parsed.valueOf(), now.valueOf())) {
      throw new Error('Agendamentos devem estar no futuro, até 1 ano a partir de hoje.');
    }

    this.date = parsed;
  }

  getValue(): Dayjs {
    return this.date;
  }

  toString(): string {
    return this.date.format('YYYY-MM-DD HH:mm');
  }

  isValid(): boolean {
    const now = dayjs();
    return this.date.isValid() && super.isValidSchedule(this.date.valueOf(), now.valueOf());
  }
}

```

### 🧪 Exemplo de uso

```
const agendamento = new Scheduled('2025-07-15 14:30');

console.log('Data agendada:', agendamento.toString()); // 2025-07-15 14:30
console.log('É válida?', agendamento.isValid());       // true

```

### 🧰 Lembre-se de instalar o dayjs:

```bash
npm install dayjs

```