# Tasks — Módulo `radius`

> **Caminho:** `src/modulos/radius/`
> **Propósito:** gestão de usuários RADIUS para autenticação em redes hotspot.

---

## 1. Presentation — Controllers

- [ ] Revisar `create-radius-user.controller.ts` — validar schema Zod da entrada
- [ ] Revisar `delete-radius-user.controller.ts` — validar permissões (admin only)
- [ ] Revisar `get-radius-users.controller.ts` — implementar paginação

## 2. Application — Use Cases

- [ ] Mover `radius-user-output.mapper.ts` para `application/mappers/`
- [ ] Refatorar `CreateRadiusUser.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `DeleteRadiusUser.ts` — sem `try/catch`, retornar `Either<Error, void>`
- [ ] Refatorar `GetRadiusUsers.ts` — sem `try/catch`, retornar `Either<Error, OutputDto[]>`

## 3. Domain

- [ ] Criar `domain/entities/radius-user.entity.ts`
- [ ] Criar `domain/errors/RadiusUserNotFoundError.ts`
- [ ] Criar `domain/errors/RadiusUserAlreadyExistsError.ts`
- [ ] Criar `domain/repositories/radius-user.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/radius-user.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/radius.routes.ts` com `tags` e `summary` (Swagger)
