# Tasks — Módulo `router`

> **Caminho:** `src/modulos/router/`
> **Propósito:** gestão de roteadores MikroTik (CRUD).

---

## 1. Presentation — Controllers

- [ ] Revisar `create-mikrotik.controller.ts` — validar schema Zod da entrada
- [ ] Revisar `delete-mikrotik.controller.ts` — validar permissões (admin only)
- [ ] Revisar `get-mikrotik.controller.ts` — retornar `OutputDto`
- [ ] Revisar `get-mikrotiks.controller.ts` — implementar paginação e filtros
- [ ] Revisar `update-mikrotik.controller.ts` — validar schema Zod (campos parciais)

## 2. Application — Use Cases

- [ ] Mover `mikrotik-output.mapper.ts` para `application/mappers/`
- [ ] Refatorar `CreateMikrotik.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `DeleteMikrotik.ts` — sem `try/catch`, retornar `Either<Error, void>`
- [ ] Refatorar `GetMikrotik.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `GetMikrotiks.ts` — sem `try/catch`, retornar `Either<Error, OutputDto[]>`
- [ ] Refatorar `UpdateMikrotik.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`

## 3. Domain

- [ ] Revisar `router-entity.ts` — garantir uso de value objects
- [ ] Criar `domain/errors/RouterNotFoundError.ts`
- [ ] Criar `domain/repositories/router.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/router.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/router.routes.ts` com `tags` e `summary` (Swagger)
