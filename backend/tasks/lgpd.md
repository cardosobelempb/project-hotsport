# Tasks — Módulo `lgpd`

> **Caminho:** `src/modulos/lgpd/`
> **Propósito:** registro e consulta de consentimento LGPD dos usuários.

---

## 1. Presentation — Controllers

- [ ] Revisar `get-lgpd-data.controller.ts` — garantir retorno de `OutputDto`
- [ ] Revisar `register-lgpd-consent.controller.ts` — validar schema Zod da entrada

## 2. Application — Use Cases

- [ ] Mover `lgpd-output.mapper.ts` para `application/mappers/`
- [ ] Refatorar `GetLgpdData.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `RegisterLgpdConsent.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`

## 3. Domain

- [ ] Criar `domain/entities/lgpd-consent.entity.ts`
- [ ] Criar `domain/errors/LgpdConsentNotFoundError.ts`
- [ ] Criar `domain/repositories/lgpd-consent.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/lgpd-consent.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/lgpd.routes.ts` com `tags` e `summary` (Swagger)
