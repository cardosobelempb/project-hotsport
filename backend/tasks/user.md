# Tasks — Módulo `user`

> **Caminho:** `src/modulos/user/`

---

## 1. Infrastructure — Controllers

- [ ] Revisar `user-register.controller.ts` — garantir retorno de `OutputDto` (não model Prisma)

## 2. Infrastructure — Routes

- [ ] Revisar `user.routes.ts` — garantir `tags` e `summary` em todas as rotas (Swagger)

## 3. Application — Use Cases

- [ ] Refatorar `user-add-address.use-case.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `user-delete-address.use-case.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `user-update-address.use-case.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Consolidar ou remover `UserRegisterUseCase.ts` (avaliar duplicidade com `auth-register`)

## 4. Domain

- [ ] Revisar `UserAlreadyExistsError.ts` — estender `AppError` de `shared/errors/`
- [ ] Revisar `user.entity.ts` — garantir uso de value objects
- [ ] Revisar `address.entity.ts` — garantir uso de value objects

## 5. Arquitetura

- [ ] Criar `application/mappers/user.mapper.ts` para converter `UserEntity` → `UserOutputDto`
- [ ] Padronizar camada de apresentação (checar se deve usar `infrastructure/` ou `presentation/`)
