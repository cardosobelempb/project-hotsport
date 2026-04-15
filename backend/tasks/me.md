# Tasks — Módulo `me`

> **Caminho:** `src/modulos/me/`
> **Propósito:** retorna dados do usuário autenticado (perfil próprio).

---

## 1. Presentation — Controllers

- [ ] Revisar `get-me.controller.ts` — garantir retorno de `OutputDto` (não model Prisma)

## 2. Application — Use Cases

- [ ] Refatorar `GetMe.ts` — sem `try/catch`, retornar `Either<Error, UserOutputDto>`
- [ ] Criar `application/mappers/me.mapper.ts` para converter entidade → DTO

## 3. Arquitetura

- [ ] Criar `infrastructure/routes/me.routes.ts` com `tags` e `summary` (Swagger)
- [ ] Garantir que a rota exige autenticação (JWT)
