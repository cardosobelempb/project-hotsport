---
applyTo: '**/*.ts,**/*.tsx'
---

# Regras TypeScript

## Princípios

- SEMPRE TypeScript — NUNCA JavaScript
- NUNCA use `any` — use `unknown` com narrowing ou modele o tipo corretamente
- SEMPRE named exports — exceto quando estritamente necessário

```ts
// NUNCA
const fn = (dados: any) => dados.nome;

// SEMPRE — modele o tipo
interface Dados {
  nome: string;
}
export const fn = ({ nome }: Dados): string => nome;
```

## Funções

- SEMPRE arrow functions — exceto quando `this` for necessário
- SEMPRE nomeie com verbos: `buscarCliente`, `criarPlano`, `validarEmail`
- SEMPRE early returns — evite ifs aninhados
- SEMPRE higher-order functions (`map`, `filter`, `reduce`) em vez de loops
- SEMPRE objeto como parâmetro quando houver mais de 2 argumentos

```ts
// NUNCA — parâmetros posicionais + loop
function processar(a: string, b: string, c: boolean) {
  const res = [];
  for (const item of lista) {
    if (item.ativo) res.push(item);
  }
  return res;
}

// SEMPRE — objeto + arrow + higher-order
interface ProcessarParams {
  a: string;
  b: string;
  c: boolean;
}
export const processar = ({ a, b, c }: ProcessarParams) =>
  lista.filter(item => item.ativo);
```

## Nomenclatura

| Contexto             | Estilo       | Exemplo                       |
| -------------------- | ------------ | ----------------------------- |
| Arquivos (geral)     | `kebab-case` | `workout-plan-routes.ts`      |
| Arquivos (use cases) | `PascalCase` | `CreateWorkoutPlan.ts`        |
| Classes              | `PascalCase` | `NotFoundError`               |
| Variáveis / funções  | `camelCase`  | `criarCliente`, `buscarPlano` |

- SEMPRE `interface` para estruturas de objeto
- `type` apenas para unions e intersections

```ts
// SEMPRE
interface Usuario {
  id: string;
  nome: string;
}

// type correto para union
type Status = 'ativo' | 'inativo';
type Admin = Usuario & { role: 'admin' };
```

## Datas — SEMPRE dayjs

```ts
import dayjs from 'dayjs';

// NUNCA
new Date().toISOString().split('T')[0];

// SEMPRE
dayjs().format('YYYY-MM-DD');
dayjs().add(1, 'day');
dayjs(data).isAfter(dayjs());
dayjs(data).diff(dayjs(), 'day');
```

## Zod v4 — Validadores Obrigatórios

SEMPRE Zod v4. NUNCA v3. NUNCA `z.string()` para tipos semânticos.

| Tipo              | SEMPRE use         | NUNCA use            |
| ----------------- | ------------------ | -------------------- |
| Email             | `z.email()`        | `z.string()`         |
| URL               | `z.url()`          | `z.string()`         |
| UUID              | `z.uuid()`         | `z.string()`         |
| IP                | `z.ip()`           | `z.string()`         |
| Data (YYYY-MM-DD) | `z.iso.date()`     | `z.string()` / regex |
| Timestamp ISO     | `z.iso.datetime()` | `z.string()` / regex |
| Horário           | `z.iso.time()`     | `z.string()` / regex |
| Duração ISO       | `z.iso.duration()` | `z.string()` / regex |
| Dia da semana     | `z.enum(WeekDay)`  | `z.string()`         |

```ts
import { z } from 'zod';
import { WeekDay } from '../generated/prisma/enums.js';

// NUNCA
z.object({ email: z.string(), data: z.string(), dia: z.string() });

// SEMPRE
z.object({
  email: z.email(),
  url: z.url(),
  dataInicio: z.iso.date(),
  dataHora: z.iso.datetime(),
  diaDaSemana: z.enum(WeekDay)
});
```
