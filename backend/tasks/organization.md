# Tasks — Módulo `organization`

> **Caminho:** `src/modulos/organization/`
> **Propósito:** gestão de organizações (tenants).

---

## 1. Presentation — Controllers (a criar)

- [ ] Criar `presentation/controllers/create-organization.controller.ts`
- [ ] Criar `presentation/controllers/get-organization.controller.ts`
- [ ] Criar `presentation/controllers/update-organization.controller.ts`

## 2. Application — Use Cases (a criar)

- [ ] Criar `CreateOrganization.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Criar `GetOrganization.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Criar `UpdateOrganization.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Criar `application/mappers/organization.mapper.ts`

## 3. Domain

- [ ] Revisar `organization.entity.ts` — garantir uso de value objects
- [ ] Criar `domain/errors/OrganizationNotFoundError.ts`
- [ ] Criar `domain/repositories/organization.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/organization.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/organization.routes.ts` com `tags` e `summary` (Swagger)
