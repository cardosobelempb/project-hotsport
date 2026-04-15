# Tasks — Módulo `dashboard`

> **Caminho:** `src/modulos/dashboard/`

---

## 1. Presentation — Controllers

- [ ] Revisar `get-dashboard-stats.controller.ts` — garantir retorno de `OutputDto`

## 2. Application — Use Cases

- [ ] Refatorar `GetDashboardStats.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Criar `application/mappers/dashboard.mapper.ts` para converter dados agregados → DTO

## 3. Arquitetura

- [ ] Criar `infrastructure/routes/dashboard.routes.ts` com `tags` e `summary` (Swagger)
- [ ] Garantir que a rota exige autenticação de admin
