# Tasks — Módulo `clear`

> **Caminho:** `src/modulos/clear/`
> **Propósito:** jobs de limpeza periódica de dados expirados/inativos.

---

## 1. Presentation — Controllers

- [ ] Revisar `delete-expired-payments.controller.ts` — extrair lógica para use case
- [ ] Revisar `delete-inactive-radius.controller.ts` — extrair lógica para use case
- [ ] Revisar `delete-lgpd-logs.controller.ts` — extrair lógica para use case

## 2. Application — Use Cases (a criar)

- [ ] Criar `DeleteExpiredPayments.ts` — use case com lógica de limpeza de pagamentos expirados
- [ ] Criar `DeleteInactiveRadiusUsers.ts` — use case com lógica de limpeza de usuários RADIUS inativos
- [ ] Criar `DeleteLgpdLogs.ts` — use case com lógica de limpeza de logs LGPD

## 3. Arquitetura

- [ ] Criar `infrastructure/routes/clear.routes.ts` com `tags` e `summary` (Swagger)
- [ ] Avaliar se os controllers devem ser protegidos por autenticação de admin
