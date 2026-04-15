# Tasks — Módulo `member`

> **Caminho:** `src/modulos/member/`
> **Propósito:** gestão de membros de uma organização/plano.

---

## 1. Presentation — Controllers (a criar)

- [ ] Criar `presentation/controllers/create-member.controller.ts`
- [ ] Criar `presentation/controllers/get-members.controller.ts`
- [ ] Criar `presentation/controllers/delete-member.controller.ts`

## 2. Application — Use Cases (a criar)

- [ ] Criar `CreateMember.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Criar `GetMembers.ts` — sem `try/catch`, retornar `Either<Error, OutputDto[]>`
- [ ] Criar `DeleteMember.ts` — sem `try/catch`, retornar `Either<Error, void>`
- [ ] Criar `application/mappers/member.mapper.ts`

## 3. Domain

- [ ] Revisar `member-entity.ts` — garantir uso de value objects
- [ ] Criar `domain/errors/MemberNotFoundError.ts`
- [ ] Criar `domain/repositories/member.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/member.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/member.routes.ts` com `tags` e `summary` (Swagger)
