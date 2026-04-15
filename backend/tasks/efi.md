# Tasks — Módulo `efi`

> **Caminho:** `src/modulos/efi/`
> **Propósito:** integração com gateway de pagamentos Efí (ex-Gerencianet).

---

## 1. Presentation — Controllers

- [ ] Revisar `efi-webhook.controller.ts` — validar assinatura do webhook (segurança)
- [ ] Revisar `get-efi-config.controller.ts` — garantir retorno de `OutputDto`
- [ ] Revisar `save-efi-config.controller.ts` — validar schema Zod da entrada

## 2. Application — Use Cases

- [ ] Mover `efi-config-output.mapper.ts` para `application/mappers/`
- [ ] Refatorar `GetEfiConfig.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `SaveEfiConfig.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Criar `ProcessEfiWebhook.ts` — use case para processar evento do webhook

## 3. Domain

- [ ] Criar `domain/entities/efi-config.entity.ts`
- [ ] Criar `domain/errors/EfiConfigNotFoundError.ts`
- [ ] Criar `domain/repositories/efi-config.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/efi-config.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/efi.routes.ts` com `tags` e `summary` (Swagger)
- [ ] Garantir que credenciais Efí são lidas de variáveis de ambiente (nunca hardcoded)
