# Tasks — Módulo `mercadopago`

> **Caminho:** `src/modulos/mercadopago/`
> **Propósito:** integração com gateway de pagamentos Mercado Pago.

---

## 1. Presentation — Controllers

- [ ] Revisar `mercadopago-webhook.controller.ts` — validar assinatura do webhook (segurança)
- [ ] Consolidar `get-config-mercadopago.controller.ts` e `get-mercadopago-config.controller.ts` (duplicidade)
- [ ] Consolidar `save-mercadopago-config.controller.ts` e `update-config-mercadopago.controller.ts` (duplicidade)

## 2. Application — Use Cases

- [ ] Mover `mercadopago-config-output.mapper.ts` para `application/mappers/`
- [ ] Refatorar `GetMercadoPagoConfig.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `SaveMercadoPagoConfig.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Criar `ProcessMercadoPagoWebhook.ts` — use case para processar evento do webhook

## 3. Domain

- [ ] Criar `domain/entities/mercadopago-config.entity.ts`
- [ ] Criar `domain/errors/MercadoPagoConfigNotFoundError.ts`
- [ ] Criar `domain/repositories/mercadopago-config.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/mercadopago-config.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/mercadopago.routes.ts` com `tags` e `summary` (Swagger)
- [ ] Garantir que credenciais MP são lidas de variáveis de ambiente (nunca hardcoded)
