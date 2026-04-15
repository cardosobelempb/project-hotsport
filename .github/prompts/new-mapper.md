# Mapper

Crie um novo mapper seguindo os padrões do projeto.

Siga as convenções em:

- #file:'../instructions/conventions.instructions.md'
- #file:'../instructions/typescript.instructions.md'

---

## Requisitos obrigatórios

- Arquivo em `{modulo}/application/mappers/` com nome `{entidade}.mapper.ts` (kebab-case)
- Classe estática com método `toDTO`
- Usar `{Entidade}DTOSchema.parse()` para validar e converter no mesmo passo
- NUNCA retornar value objects (`UUIDVO`, `EmailVO`, etc.) — converter para primitivos
- NUNCA deixar `Date` no output — converter com `.toISOString()`
- O schema `{Entidade}DTOSchema` deve viver em `shared/schemas/{entidade}-dto.schema.ts`

---

## Estrutura obrigatória

```typescript
// {entidade}.mapper.ts

import { z } from "zod";
import { {Entidade}Entity } from "@/modules/{modulo}/domain/entities/{entidade}.entity";

export const {Entidade}DTOSchema = z.object({
  id: z.string().uuid(),
  // demais campos como primitivos
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type {Entidade}DTOType = z.infer<typeof {Entidade}DTOSchema>;

export class {Entidade}Mapper {
  static toDTO(entity: {Entidade}Entity): {Entidade}DTOType {
    return {Entidade}DTOSchema.parse({
      id: entity.id.toString(),           // UUIDVO → string
      // demais campos
      createdAt: entity.createdAt.toISOString(), // Date → string
      updatedAt: entity.updatedAt.toISOString(),
    });
  }
}
```

---

## Exemplo

<!-- Adicione aqui um mapper real do projeto como referência -->

```typescript
import { EmailVO, UUIDVO } from '@/core';
import { Prisma, type Auth } from '@/generated/prisma';

import { AuthEntity } from '../../domain/entities/auth.entity';
import { AuthLoginResponseSchemaType } from '../../infrastructure/schemas/auth.login.schema';

export class AuthLoginPrismaMapper {
  static toDomain(raw: Auth): AuthEntity {
    return AuthEntity.create({
      id: UUIDVO.create(raw.id),
      userId: UUIDVO.create(raw.userId),
      email: EmailVO.create(raw.email),
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt
    });
  }

  static toPrisma(entity: AuthEntity): Prisma.AuthUncheckedCreateInput {
    return {
      id: entity.id.toString(),
      userId: entity.userId.toString(),
      email: entity.email.toString(),
      passwordHash: entity.passwordHash?.toString() ?? '',
      createdAt: entity.createdAt
    };
  }

  static toUpdatePrisma(entity: AuthEntity): Prisma.AuthUncheckedUpdateInput {
    return {
      email: entity.email.toString(),
      passwordHash: entity.passwordHash?.toString() ?? ''
    };
  }

  // Domain entities → resposta HTTP
  static toHttp(tokens: {
    accessToken: string;
    refreshToken?: string;
  }): AuthLoginResponseSchemaType {
    return {
      message: 'Authentication successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || ''
    };
  }
}
```

---

## Perguntas

Se as informações não forem fornecidas, pergunte:

1. Qual é o **módulo**? (ex: `auth`, `workout`, `user`)
2. Qual é a **entidade**? (ex: `User`, `Workout`)
3. Quais são os **campos** da entidade? (nome e tipo)
4. Algum campo usa **value object**? (ex: `UUIDVO`, `EmailVO`)
