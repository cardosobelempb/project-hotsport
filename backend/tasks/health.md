# Tasks — Módulo `health`

> **Caminho:** `src/modulos/health/`
> **Propósito:** endpoint de health check da API.

---

## 1. Presentation — Controllers

- [ ] Revisar `get-health.controller.ts` — retornar status do banco, versão e uptime

## 2. Application — Use Cases (a criar)

- [ ] Criar `GetHealthStatus.ts` — verificar conexão com banco Postgres e retornar status

## 3. Arquitetura

- [ ] Criar `infrastructure/routes/health.routes.ts` com `tags` e `summary` (Swagger)
- [ ] Garantir que a rota é pública (sem autenticação)
