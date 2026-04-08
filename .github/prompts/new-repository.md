# Repository

Crie um novo repositório seguindo os padrões do projeto.

Siga as convenções em:

- #file:'../instructions/conventions.instructions.md'
- #file:'../instructions/typescript.instructions.md'

---

## Requisitos obrigatórios

- Interface em `{modulo}/domain/repositories/{entidade}.repository.ts`
- Implementação em `{modulo}/infrastructure/repository/{entidade}.repo.ts`
- A interface define o contrato — a implementação usa Prisma
- NUNCA expor o model Prisma fora do repositório — retornar a `Entity` do domínio
- NUNCA usar try/catch
- Métodos nomeados de forma semântica: `findById`, `findByEmail`, `save`, `delete`
- Registrar a implementação no `container.ts`

---

## Estrutura obrigatória

### Interface (domínio)

```typescript
// {entidade}.repository.ts

import { {Entidade}Entity } from "@/modules/{modulo}/domain/entities/{entidade}.entity";

export abstract class {Entidade}Repository {
  abstract findById(id: string): Promise<{Entidade}Entity | null>;
  abstract save(entity: {Entidade}Entity): Promise<void>;
  // demais métodos necessários
}
```

### Implementação (infraestrutura)

```typescript
// {entidade}.repo.ts

import { prisma } from "@/lib/prisma";
import { {Entidade}Repository } from "@/modules/{modulo}/domain/repositories/{entidade}.repository";
import { {Entidade}Entity } from "@/modules/{modulo}/domain/entities/{entidade}.entity";

export class Prisma{Entidade}Repository implements {Entidade}Repository {
  async findById(id: string): Promise<{Entidade}Entity | null> {
    const record = await prisma.{entidade}.findUnique({ where: { id } });

    if (!record) return null;

    return {Entidade}Entity.restore(record); // model Prisma → Entity
  }

  async save(entity: {Entidade}Entity): Promise<void> {
    await prisma.{entidade}.upsert({
      where: { id: entity.id.toString() },
      create: { /* campos */ },
      update: { /* campos */ },
    });
  }
}
```

### Registro no container

```typescript
// container.ts

import { Prisma{Entidade}Repository } from "@/modules/{modulo}/infrastructure/repository/{entidade}.repo";

const {entidade}Repository = new Prisma{Entidade}Repository();
```

---

## Exemplo

<!-- Adicione aqui um repositório real do projeto como referência -->

```typescript

```

import { SearchInput, SearchOutput } from "@/core";
import { Prisma } from "@/generated/prisma";
import { AuthEntity } from "@/modulos/auth/domain/entities/auth.entity";
import { prisma } from "@/shared/lib/db";

import { AuthPrismaMapper } from "../../application/mappers/auth-prisma.mapper";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class AuthPrismaRepository implements AuthRepository {
async search(params: SearchInput): Promise<SearchOutput<AuthEntity>> {
const page = params.page ?? 1;
const perPage = params.perPage ?? 15;
const filter = params.filter?.trim() ?? "";
const sortDirection = params.sortDirection ?? "desc";
const allowedSortBy = new Set<keyof Prisma.AuthOrderByWithRelationInput>([
"createdAt",
]);
const sortBy =
params.sortBy &&
allowedSortBy.has(
params.sortBy as keyof Prisma.AuthOrderByWithRelationInput,
)
? params.sortBy
: "createdAt";

    const where: Prisma.AuthWhereInput = filter
      ? {
          OR: [{ email: { contains: filter, mode: "insensitive" } }],
        }
      : {};

    const [total, auths] = await prisma.$transaction([
      prisma.auth.count({ where }),
      prisma.auth.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      items: auths.map(AuthPrismaMapper.toDomain),
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: page,
      perPage,
      sortBy,
      sortDirection,
      filter,
    };

}

async findByUserId(userId: string): Promise<AuthEntity | null> {
const auth = await prisma.auth.findUnique({
where: { id: userId },
include: { user: true },
});
if (!auth) return null;
return AuthPrismaMapper.toDomain(auth);
}

async findById(id: string): Promise<AuthEntity | null> {
const auth = await prisma.auth.findUnique({
where: { id },
include: { user: true },
});
if (!auth) return null;
return AuthPrismaMapper.toDomain(auth);
}

async findByEmail(email: string): Promise<AuthEntity | null> {
const auth = await prisma.auth.findUnique({
where: { email },
include: { user: true },
});

    if (!auth) return null;
    return AuthPrismaMapper.toDomain(auth);

}

async save(entity: AuthEntity): Promise<AuthEntity> {
const data = AuthPrismaMapper.toPrisma(entity);
const updateData: Prisma.AuthUncheckedUpdateInput = {
userId: entity.userId.toString(),
email: entity.email.toString(),
passwordHash: entity.passwordHash?.toString() ?? "",
};

    const auth = await prisma.auth.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: updateData,
    });

    return AuthPrismaMapper.toDomain(auth);

}

async delete(entity: AuthEntity): Promise<void> {
await prisma.auth.delete({
where: { id: entity.id.toString() },
});
}
}

---

## Perguntas

Se as informações não forem fornecidas, pergunte:

1. Qual é o **módulo**? (ex: `auth`, `workout`, `user`)
2. Qual é a **entidade**? (ex: `User`, `Workout`)
3. Quais **métodos** o repositório precisa? (ex: `findById`, `findByEmail`, `save`, `delete`)
4. Há alguma **query especial** necessária? (ex: busca com relações, filtros)
