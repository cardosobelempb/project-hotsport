# Tasks — Módulo `voucher`

> **Caminho:** `src/modulos/voucher/`
> **Propósito:** geração e gestão de vouchers de acesso à rede hotspot.

---

## 1. Presentation — Controllers (a criar)

- [ ] Criar `presentation/controllers/create-voucher.controller.ts`
- [ ] Criar `presentation/controllers/redeem-voucher.controller.ts`
- [ ] Criar `presentation/controllers/get-vouchers.controller.ts`

## 2. Application — Use Cases (a criar)

- [ ] Criar `CreateVoucher.ts` — gera código único e define validade
- [ ] Criar `RedeemVoucher.ts` — valida e ativa voucher para o usuário
- [ ] Criar `GetVouchers.ts` — lista vouchers com status e filtros
- [ ] Criar `application/mappers/voucher.mapper.ts`

## 3. Domain

- [ ] Revisar `voucher-entity.ts` — garantir campos: código, validade, status, plano vinculado
- [ ] Criar `domain/errors/VoucherNotFoundError.ts`
- [ ] Criar `domain/errors/VoucherAlreadyRedeemedError.ts`
- [ ] Criar `domain/errors/VoucherExpiredError.ts`
- [ ] Criar `domain/repositories/voucher.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/voucher.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/voucher.routes.ts` com `tags` e `summary` (Swagger)
