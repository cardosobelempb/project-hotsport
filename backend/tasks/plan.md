# Tasks — Módulo `plan`

> **Caminho:** `src/modulos/plan/`

---

## 1. Presentation — Controllers / Routes

- [ ] Revisar `planos-routes.ts` — renomear para inglês (`plan.routes.ts`)
- [ ] Revisar `planos-publicos-routes.ts` — renomear para inglês (`plan-public.routes.ts`)
- [ ] Revisar `plan-routes.ts` — consolidar com `planos-routes.ts` (possível duplicidade)
- [ ] Garantir `tags` e `summary` em todas as rotas (Swagger)

## 2. Application — Use Cases

- [ ] Refatorar `CreatePlan.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `DeletePlan.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `GetPlans.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `UpdatePlan.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Avaliar remoção de `PlanUseCases.ts` (barrel file — pode ser desnecessário)

## 3. Application — Mappers

- [ ] Mover `plan-output.mapper.ts` de `usecases/` para `application/mappers/`

## 4. Domain

- [ ] Criar `domain/entities/plan.entity.ts`
- [ ] Criar `domain/errors/PlanNotFoundError.ts`
- [ ] Criar `domain/repositories/plan.repository.ts` (interface)

## 5. Arquitetura

- [ ] Criar `infrastructure/repositories/plan.repo.ts` com implementação Prisma
- [ ] Mover arquivos de rotas da pasta `controllers/` para `presentation/routes/`
