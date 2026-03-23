---
paths:
  - '**/*.ts'
---

# 🟦 Regras TypeScript

> Aplica-se a **todos os arquivos `.ts`** do projeto.

---

## Índice

- [Princípios Básicos](#princípios-básicos)
- [Funções](#funções)
- [Nomenclatura](#nomenclatura)
- [Datas](#datas)
- [Zod](#zod)

---

## Princípios Básicos

- **SEMPRE** TypeScript — **NUNCA** JavaScript
- **NUNCA** `any` — use `unknown` com narrowing ou modele o tipo
- **SEMPRE** named exports — exceto quando estritamente necessário

```ts
// ❌ any desliga o TypeScript
const processar = (dados: any) => dados.nome.toUpperCase();

// ✅ unknown com narrowing
const processar = (dados: unknown): string => {
  if (typeof dados !== 'object' || dados === null || !('nome' in dados)) {
    throw new Error('Formato inválido');
  }
  return (dados as { nome: string }).nome.toUpperCase();
};

// ✅ Ideal — modele o tipo
interface DadosEntrada {
  nome: string;
}
const processar = ({ nome }: DadosEntrada): string => nome.toUpperCase();
```

---

## Funções

- **SEMPRE** arrow functions — exceto quando `this` for necessário
- **SEMPRE** nomeie com **verbos**
- **SEMPRE** early returns — evite ifs aninhados
- **SEMPRE** higher-order functions em vez de loops imperativos
- **SEMPRE** objeto como parâmetro quando houver mais de 2 argumentos

```ts
// ❌ Função convencional, parâmetros posicionais, loop
function processarClientes(lista: Cliente[], ativo: boolean, limite: number) {
  const resultado = [];
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].ativo === ativo) resultado.push(lista[i]);
  }
  return resultado.slice(0, limite);
}

// ✅ Arrow, objeto, higher-order, early return
interface FiltrarClientesParams {
  lista: Cliente[];
  ativo: boolean;
  limite: number;
}

const filtrarClientes = ({ lista, ativo, limite }: FiltrarClientesParams) =>
  lista.filter(c => c.ativo === ativo).slice(0, limite);
```

```ts
// ❌ Aninhamento profundo
const processarPagamento = (p: Pagamento) => {
  if (p) {
    if (p.valor > 0) {
      if (p.status === 'pendente') {
        /* lógica */
      }
    }
  }
};

// ✅ Early returns
const processarPagamento = (p: Pagamento) => {
  if (!p) return;
  if (p.valor <= 0) return;
  if (p.status !== 'pendente') return;
  // lógica principal — sem aninhamento
};
```

---

## Nomenclatura

| Contexto             | Estilo       | Exemplo                               |
| -------------------- | ------------ | ------------------------------------- |
| Arquivos (geral)     | `kebab-case` | `workout-plan-routes.ts`              |
| Arquivos (use cases) | `PascalCase` | `CreateWorkoutPlan.ts`                |
| Classes              | `PascalCase` | `NotFoundError`, `WorkoutPlanService` |
| Interfaces / Types   | `PascalCase` | `InputDto`, `OutputDto`               |
| Variáveis / funções  | `camelCase`  | `criarCliente`, `buscarPlano`         |
| Rotas HTTP           | `kebab-case` | `/workout-plans/:id/days`             |

```ts
// ❌ type para estrutura simples
type Usuario = { id: string; nome: string };

// ✅ interface para objetos
interface Usuario {
  id: string;
  nome: string;
}

// ✅ type é correto para unions e intersections
type Status = 'ativo' | 'inativo' | 'suspenso';
type AdminUsuario = Usuario & { role: 'admin' };
```

---

## Datas

- **SEMPRE** use `dayjs` — **NUNCA** `new Date()` para formatação ou cálculos

```ts
import dayjs from 'dayjs';

// ❌ Nunca
const hoje = new Date().toISOString().split('T')[0];
const amanha = new Date(Date.now() + 86400000);

// ✅ Sempre
const hoje = dayjs().format('YYYY-MM-DD');
const amanha = dayjs().add(1, 'day').format('YYYY-MM-DD');
const expirou = dayjs().isAfter(dayjs(assinatura.dataExpiracao));
const diasRestantes = dayjs(assinatura.dataExpiracao).diff(dayjs(), 'day');
const exibir = dayjs(usuario.criadoEm).format('DD/MM/YYYY');
```

---

## Zod

- **SEMPRE** Zod **v4** — nunca v3
- **SEMPRE** use validadores semânticos — evite regex manuais
- **SEMPRE** `z.iso.*` para datas e horários

### Tabela de validadores obrigatórios

| Tipo              | ✅ Use             | ❌ Nunca use         |
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

// ❌ Fraco
const schema = z.object({
  email: z.string(),
  dataInicio: z.string(),
  diaDaSemana: z.string()
});

// ✅ Semântico — Zod v4
const schema = z.object({
  email: z.email(),
  url: z.url(),
  uuid: z.uuid(),
  dataInicio: z.iso.date(),
  dataHora: z.iso.datetime(),
  horario: z.iso.time(),
  duracao: z.iso.duration(),
  diaDaSemana: z.enum(WeekDay)
});

// Inferência de tipo — sem duplicação
type FormData = z.infer<typeof schema>;
```
