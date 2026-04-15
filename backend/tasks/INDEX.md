# Backend — Índice de Tasks por Módulo

> Gerado em: 2026-04-10
> Cada arquivo lista tarefas específicas de controllers, use cases, mappers, domain e arquitetura.

---

## Módulos com use cases e controllers implementados

| Módulo        | Arquivo                            | Use Cases        | Controllers              | Prioridade |
| ------------- | ---------------------------------- | ---------------- | ------------------------ | ---------- |
| `auth`        | [auth.md](./auth.md)               | 8                | 3 infra + 3 presentation | 🔴 Alta    |
| `admin`       | [admin.md](./admin.md)             | 4 (duplicidades) | 1 presentation           | 🔴 Alta    |
| `payment`     | [payment.md](./payment.md)         | 3                | 10 presentation          | 🔴 Alta    |
| `plan`        | [plan.md](./plan.md)               | 5                | 3 rotas (presentation)   | 🟡 Média   |
| `radius`      | [radius.md](./radius.md)           | 4                | 3 presentation           | 🟡 Média   |
| `router`      | [router.md](./router.md)           | 6                | 5 presentation           | 🟡 Média   |
| `mercadopago` | [mercadopago.md](./mercadopago.md) | 2 (duplicidades) | 5 presentation           | 🟡 Média   |
| `efi`         | [efi.md](./efi.md)                 | 2                | 3 presentation           | 🟡 Média   |
| `lgpd`        | [lgpd.md](./lgpd.md)               | 2                | 2 presentation           | 🟡 Média   |
| `user`        | [user.md](./user.md)               | 4                | 1 infra                  | 🟡 Média   |
| `dashboard`   | [dashboard.md](./dashboard.md)     | 1                | 1 presentation           | 🟢 Baixa   |
| `me`          | [me.md](./me.md)                   | 1                | 1 presentation           | 🟢 Baixa   |
| `poc`         | [poc.md](./poc.md)                 | 1                | 1 presentation           | 🟢 Baixa   |

---

## Módulos apenas com entidades (sem use cases nem controllers)

| Módulo         | Arquivo                              | O que falta                             | Prioridade |
| -------------- | ------------------------------------ | --------------------------------------- | ---------- |
| `hotspot`      | [hotspot.md](./hotspot.md)           | Use cases + controllers + typos         | 🔴 Alta    |
| `otp`          | [otp.md](./otp.md)                   | Mover use cases de `auth` + controllers | 🔴 Alta    |
| `voucher`      | [voucher.md](./voucher.md)           | Use cases + controllers completos       | 🟡 Média   |
| `member`       | [member.md](./member.md)             | Use cases + controllers completos       | 🟡 Média   |
| `organization` | [organization.md](./organization.md) | Use cases + controllers completos       | 🟡 Média   |
| `whatsapp`     | [whatsapp.md](./whatsapp.md)         | Use cases + routes                      | 🟡 Média   |

---

## Módulos de infraestrutura/suporte

| Módulo   | Arquivo                  | O que falta                   | Prioridade |
| -------- | ------------------------ | ----------------------------- | ---------- |
| `clear`  | [clear.md](./clear.md)   | Extrair lógica para use cases | 🟡 Média   |
| `health` | [health.md](./health.md) | Use case + route              | 🟢 Baixa   |

---

## Inconsistências arquiteturais globais (cross-cutting)

- [ ] **Camada de apresentação mista**: `auth` e `user` usam `infrastructure/controllers/`; demais módulos usam `presentation/controllers/` — escolher e padronizar um padrão
- [ ] **Ausência de rotas**: apenas `auth` e `user` têm `infrastructure/routes/`; criar rotas para todos os módulos
- [ ] **Mappers dentro de `usecases/`**: mover para `application/mappers/` em todos os módulos
- [ ] **Nomes em português**: `planos-routes.ts`, `update-pagamento-status.controller.ts` — renomear para inglês
- [ ] **Typos**: `domain/erros/` (auth), `emuns/` (hotspot) — corrigir nomes de pastas
- [ ] **Módulo `poc`**: avaliar remoção antes do release de produção
