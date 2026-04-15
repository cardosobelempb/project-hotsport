# Tasks — Módulo `hotspot`

> **Caminho:** `src/modulos/hotspot/`

---

## 1. Presentation — Controllers (a criar)

- [ ] Criar `presentation/controllers/connect-hotspot.controller.ts`
- [ ] Criar `presentation/controllers/disconnect-hotspot.controller.ts`
- [ ] Criar `presentation/controllers/get-hotspot-session.controller.ts`

## 2. Application — Use Cases (a criar)

- [ ] Criar `ConnectHotspotUser.ts` — valida credenciais e inicia sessão
- [ ] Criar `DisconnectHotspotUser.ts` — encerra sessão ativa
- [ ] Criar `GetActiveSession.ts` — retorna sessão ativa do usuário

## 3. Domain

- [ ] Revisar `hotspot-user-entity.ts` — garantir uso de value objects
- [ ] Revisar `session.entity.ts` — garantir uso de value objects
- [ ] Corrigir typo nos enums: pasta `emuns/` → renomear para `enums/`
- [ ] Revisar `hotspot-user-status.enun.ts` → renomear para `hotspot-user-status.enum.ts`
- [ ] Revisar `session-status.enun.ts` → renomear para `session-status.enum.ts`

## 4. Arquitetura

- [ ] Criar `domain/repositories/hotspot-session.repository.ts` (interface)
- [ ] Criar `infrastructure/repositories/hotspot-session.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/hotspot.routes.ts` com `tags` e `summary` (Swagger)
