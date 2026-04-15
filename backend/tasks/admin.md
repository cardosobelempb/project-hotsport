# Tasks — Módulo `admin`

> **Caminho:** `src/modulos/admin/`

---

## 1. Presentation — Controllers

- [ ] Revisar `admin-login.controller.ts` — garantir retorno de `OutputDto` (não model Prisma)
- [ ] Revisar `index.ts` do barrel (remover se desnecessário)

## 2. Presentation — Routes

- [ ] Revisar `admin.router.ts` — garantir `tags` e `summary` em todas as rotas (Swagger)
- [ ] Renomear `admin.router.ts` → `admin.routes.ts` (padronizar nomenclatura)

## 3. Application — Use Cases

- [ ] Consolidar `admin-login.usecase.ts` e `LoginAdmin.ts` (possível duplicidade)
- [ ] Consolidar `AuthenticateAdmin.ts` e `admin-login.usecase.ts` (possível duplicidade)
- [ ] Refatorar use case vencedor — sem `try/catch`, retornar `Either<Error, OutputDto>`

## 4. Domain

- [ ] Criar `domain/entities/admin.entity.ts`
- [ ] Criar `domain/errors/AdminNotFoundError.ts`
- [ ] Criar `domain/repositories/admin.repository.ts` (interface)

## 5. Arquitetura

- [ ] Criar `infrastructure/repositories/admin.repo.ts` com implementação Prisma
- [ ] Criar `application/mappers/admin.mapper.ts` para converter entidade → DTO
