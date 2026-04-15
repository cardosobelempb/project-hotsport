# Use case

Crie um novo use case seguindo os padrões do projeto.

Siga as convenções em:

- #file:'../instructions/conventions.instructions.md'
- #file:'../instructions/typescript.instructions.md'

---

## Requisitos obrigatórios

- Arquivo em `{modulo}/application/use-cases/` com nome `{modulo}-{acao}.use-case.ts` (kebab-case)
- Classe com método `execute`
- `UseCaseInput` e `UseCaseOutput` definidos no mesmo arquivo
- Tipo de retorno `Either<ErroCustomizado, UseCaseOutput>` usando `left()` e `right()`
- Chamar repositório via interface — nunca Prisma diretamente no use case
- NUNCA usar try/catch
- NUNCA retornar o model Prisma — mapear para `UseCaseOutput` via mapper
- Lançar erros customizados de `{modulo}/domain/errors/{modulo}.errors.ts`
- Injetar dependências via construtor (repositórios e providers)

---

## Estrutura obrigatória

```typescript
// {modulo}-{acao}.use-case.ts

import { Either, left, right } from "@/shared/either";
import { ErroCustomizado } from "@/modules/{modulo}/domain/errors/{modulo}.errors";
import { {Entidade}Repository } from "@/modules/{modulo}/domain/repositories/{entidade}.repository";

export interface {Modulo}{Acao}UseCaseInput {
  // campos de entrada
}

export interface {Modulo}{Acao}UseCaseOutput {
  // campos de saída — apenas primitivos, nunca value objects
}

export type {Modulo}{Acao}UseCaseResult = Either<
  ErroCustomizado,
  {Modulo}{Acao}UseCaseOutput
>;

export class {Modulo}{Acao}UseCase {
  constructor(
    private readonly {entidade}Repository: {Entidade}Repository,
    // outros providers injetados aqui
  ) {}

  async execute(input: {Modulo}{Acao}UseCaseInput): Promise<{Modulo}{Acao}UseCaseResult> {
    // lógica aqui
  }
}
```

---

## Exemplo

<!-- Adicione aqui um use case real do projeto como referência -->

```typescript

```

---

## Perguntas

Se o nome da ação ou da entidade não forem fornecidos, pergunte:

1. Qual é o **módulo**? (ex: `auth`, `workout`, `user`)
2. Qual é a **ação**? (ex: `login`, `create`, `delete`)
3. Quais são os **campos de entrada**?
4. Quais são os **campos de saída**?
