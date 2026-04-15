# Tasks — Módulo `payment`

> **Caminho:** `src/modulos/payment/`

---

## 1. Presentation — Controllers

- [ ] Revisar `create-payment.controller.ts` — avaliar duplicidade com `create-payments.controller.ts`
- [ ] Remover ou consolidar `create-payments.controller.ts` (plural inconsistente)
- [ ] Revisar `get-payment.controller.ts` + `get-payment-auth.controller.ts` — separar rotas públicas/autenticadas
- [ ] Revisar `get-payment-by-id.controller.ts` + `get-payment-auth-by-id.controller.ts` — consolidar se possível
- [ ] Revisar `get-payments.controller.ts` — paginação e filtros
- [ ] Revisar `delete-payment-auth.controller.ts` — validar permissões
- [ ] Revisar `update-pagamento-status.controller.ts` — renomear para inglês (`update-payment-status.controller.ts`)

## 2. Application — Use Cases

- [ ] Refatorar `GetPayments.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `ProcessPayment.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `UpdatePaymentStatus.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`

## 3. Application — Mappers

- [ ] Mover `payment-output.mapper.ts` de `usecases/` para `application/mappers/`

## 4. Domain

- [ ] Revisar `payment.entity.ts` + `payment.props.ts` — consolidar ou separar responsabilidades
- [ ] Criar `domain/errors/PaymentNotFoundError.ts`

## 5. Arquitetura

- [ ] Criar `infrastructure/routes/payment.routes.ts` com `tags` e `summary` (Swagger)
- [ ] Criar `infrastructure/repositories/` com interface e implementação Prisma
