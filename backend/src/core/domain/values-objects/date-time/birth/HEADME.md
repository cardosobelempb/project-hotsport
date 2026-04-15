### 🧱 AbstractBirth (classe base)
```
export abstract class AbstractBirth {
  protected abstract date: unknown;

  /** Retorna a data no formato YYYY-MM-DD */
  abstract toString(): string;

  /** Retorna a data como objeto bruto (Date, Dayjs, etc.) */
  abstract getValue(): unknown;

  /** Verifica se a data é válida */
  abstract isValid(): boolean;

  /** Calcula a idade atual com base na data de nascimento */
  abstract getAge(): number;

  /** Validação comum de idade (mín: 0, máx: 130 anos) */
  protected isValidAge(age: number): boolean {
    return age >= 0 && age <= 130;
  }
}

```

### 📦 Exemplo: Implementação com dayjs

```
import dayjs, { Dayjs } from 'dayjs';
import { AbstractBirth } from './AbstractBirth';

export class DayjsBirth extends AbstractBirth {
  protected date: Dayjs;

  constructor(input: string | Date | Dayjs) {
    super();
    const parsed = dayjs(input);

    if (!parsed.isValid()) {
      throw new Error('Data inválida.');
    }

    const age = DayjsBirth.calculateAge(parsed);
    if (!super.isValidAge(age)) {
      throw new Error('Idade fora do intervalo permitido (0-130 anos).');
    }

    this.date = parsed.startOf('day');
  }

  getValue(): Dayjs {
    return this.date;
  }

  toString(): string {
    return this.date.format('YYYY-MM-DD');
  }

  isValid(): boolean {
    return this.date.isValid() && super.isValidAge(this.getAge());
  }

  getAge(): number {
    return DayjsBirth.calculateAge(this.date);
  }

  private static calculateAge(date: Dayjs): number {
    const today = dayjs();
    return today.diff(date, 'year');
  }
}

```

### 🧪 Uso com dayjs:

```
const dob = new DayjsBirth('1992-11-20');
console.log(dob.toString()); // 1992-11-20
console.log(dob.getAge());   // por exemplo: 32
```