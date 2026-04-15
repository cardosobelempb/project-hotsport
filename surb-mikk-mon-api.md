# 📘 SURB MikkMon API — Documento Funcional Profissional

> **Versão:** 1.0.0
> **Stack alvo:** Node.js + TypeScript + PostgreSQL + TypeORM + JWT + MikroTik RouterOS
> **Objetivo:** servir como documento mestre de **arquitetura funcional, regras de negócio, CRUDs, autenticação, RBAC e roadmap de implementação** do projeto.

---

## 📑 Sumário

1. Visão Geral
2. Arquitetura Sugerida
3. Fluxos de Autenticação
4. CRUD por Módulo
5. Fluxos de Onboarding
6. Fluxos Hotspot e Voucher
7. LGPD e Segurança
8. Matriz RBAC
9. Riscos Técnicos
10. Roadmap de Implementação

---

## 🧭 Visão Geral

O **Surb MikkMon API** é uma plataforma multi-tenant para gestão de:

- organizações
- membros e usuários
- roteadores MikroTik
- planos hotspot
- vouchers
- sessões e autenticação
- consentimento LGPD
- integrações de pagamento
- OTP e recuperação de conta

Este documento foi estruturado para apoiar:

- implementação backend enterprise
- documentação Swagger/OpenAPI
- onboarding técnico da equipe
- padronização de serviços
- escalabilidade futura

---

# 📘 SURB MikkMon API — Fluxo de CRUD por Módulo + Autenticação

> Documento base de arquitetura funcional para implementação da API em **Node.js + TypeScript + PostgreSQL + TypeORM**, com foco em **multi-tenant, MikroTik, vouchers, hotspot, LGPD e autenticação JWT**.

---

# 🎯 Objetivo

Este documento define o **fluxo funcional de CRUD de cada módulo**, regras de negócio, endpoints sugeridos, relacionamentos, validações e fluxo de autenticação.

A ideia é servir como **blueprint reutilizável da implementação**.

---

# 🧱 Arquitetura sugerida

```text
src/
 ├── modules/
 │   ├── auth/
 │   ├── organization/
 │   ├── users/
 │   ├── members/
 │   ├── mikrotik/
 │   ├── hotspot-plans/
 │   ├── hotspot-users/
 │   ├── vouchers/
 │   ├── sessions/
 │   ├── payments/
 │   ├── lgpd/
 │   └── otp/
 │
 ├── shared/
 │   ├── infra/
 │   ├── errors/
 │   ├── utils/
 │   └── middleware/
```

---

# 🔐 1) AUTHENTICATION MODULE

## Objetivo

Responsável por:

- login por email/senha
- refresh token
- logout
- login OTP
- controle multi-tenant

## Endpoints

### POST `/auth/login`

```json
{
  "email": "admin@surb.com",
  "password": "123456"
}
```

### Fluxo

1. Buscar `user`
2. Buscar `account`
3. Validar password hash
4. Buscar memberships
5. Gerar `access_token`
6. Gerar `refresh_token`
7. Persistir em `token`
8. Retornar tenant atual + roles

## Response

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "organization": {},
  "roles": ["OWNER"]
}
```

---

### POST `/auth/refresh`

Renova access token.

### POST `/auth/logout`

Revoga refresh token.

### POST `/auth/otp/request`

Solicita código SMS.

### POST `/auth/otp/verify`

Valida OTP.

---

# 🏢 2) ORGANIZATION MODULE

## CRUD

### CREATE

### POST `/organizations`

Cria tenant.

## Regras

- `slug` único
- cria OWNER inicial

### READ

- GET `/organizations`
- GET `/organizations/:id`

### UPDATE

- PATCH `/organizations/:id`

### DELETE

- DELETE `/organizations/:id`

## Impacto estratégico

Tenant é a base de isolamento de dados.

---

# 👤 3) USERS MODULE

## CREATE

### POST `/users`

```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@email.com",
  "cpf": "000.000.000-00"
}
```

## Regras

- email único
- cpf único
- hash de senha em `account`

## CRUD

- GET `/users`
- GET `/users/:id`
- PATCH `/users/:id`
- DELETE `/users/:id`

## Submódulos

- addresses
- accounts
- tokens
- otp

---

# 👥 4) MEMBERS MODULE

Relaciona usuário com organização.

## CRUD

- POST `/organizations/:orgId/members`
- GET `/organizations/:orgId/members`
- PATCH `/members/:id`
- DELETE `/members/:id`

## Regras

- unique `(organization_id, user_id)`
- roles:
  - OWNER
  - ADMIN
  - OPERATOR

## Autorização

RBAC obrigatório.

---

# 📍 5) ADDRESS MODULE

## CRUD

- POST `/users/:userId/addresses`
- GET `/users/:userId/addresses`
- PATCH `/addresses/:id`
- DELETE `/addresses/:id`

## Regras

- apenas 1 `is_primary=true`

---

# 🌐 6) MIKROTIK MODULE

## Objetivo

Cadastro de roteadores e teste de conexão.

## CRUD

- POST `/mikrotiks`
- GET `/mikrotiks`
- GET `/mikrotiks/:id`
- PATCH `/mikrotiks/:id`
- DELETE `/mikrotiks/:id`

## Extra endpoints

### POST `/mikrotiks/:id/test-connection`

## Fluxo

1. Buscar credenciais
2. Decriptar senha
3. Conectar RouterOS
4. Atualizar status

## Status

- ONLINE
- OFFLINE
- ERROR

---

# 📦 7) HOTSPOT PLAN MODULE

## CRUD

- POST `/hotspot-plans`
- GET `/hotspot-plans`
- PATCH `/hotspot-plans/:id`
- DELETE `/hotspot-plans/:id`

## Tipos

- TIME
- DATA
- UNLIMITED

## Regras

- TIME → `duration_secs`
- DATA → `data_limit_mb`

---

# 👨‍💻 8) HOTSPOT USERS MODULE

Usuários sincronizados com MikroTik.

## CRUD

- POST `/hotspot-users`
- GET `/hotspot-users`
- GET `/hotspot-users/:id`
- PATCH `/hotspot-users/:id`
- DELETE `/hotspot-users/:id`

## Fluxo CREATE

1. salvar DB
2. criar no MikroTik
3. sincronizar status

## Status

- PENDING
- ACTIVE
- BLOCKED
- EXPIRED

---

# 🎟️ 9) VOUCHERS MODULE

## CRUD

- POST `/vouchers/generate`
- GET `/vouchers`
- GET `/vouchers/:id`
- PATCH `/vouchers/:id/revoke`
- DELETE `/vouchers/:id`

## Fluxo Generate

1. validar plan
2. buscar mikrotik
3. gerar código
4. persistir DB
5. criar hotspot user MikroTik
6. retornar lote

## Exemplo

```json
{
  "quantity": 100,
  "planId": "uuid",
  "mikrotikId": "uuid"
}
```

## Regras

- code único
- status inicial `UNUSED`

---

# 💳 10) PAYMENT MODULE

## Mercado Pago

- POST `/payments/mercadopago/config`
- GET `/payments/mercadopago/config`

## EFI PIX

- POST `/payments/efi/config`
- GET `/payments/efi/config`

## Regras

- credenciais criptografadas
- webhook secret validado

---

# 📱 11) OTP MODULE

## Fluxo

### POST `/otp/request`

1. gerar código
2. hash
3. salvar `otp`
4. enviar SMS

### POST `/otp/verify`

1. buscar OTP
2. validar expiração
3. validar tentativas
4. marcar `used_at`

---

# 🛡️ 12) LGPD CONSENT MODULE

## CRUD funcional

- POST `/lgpd/consents`
- GET `/lgpd/consents/:userId`
- PATCH `/lgpd/consents/:id/revoke`

## Regras críticas

- versionamento obrigatório
- rastrear IP
- rastrear user-agent
- impedir duplicidade `(user, org, version)`

## Fluxo

1. usuário aceita termos
2. registra versão
3. salva evidência
4. permite revogação

---

# 🔐 MIDDLEWARES GLOBAIS

## Auth Middleware

- validar JWT
- organization scope
- role scope

## Tenant Middleware

Extrai `organizationId`.

## RBAC Middleware

```ts
requireRole(['OWNER', 'ADMIN']);
```

## Validation Middleware

- Zod
- DTO schemas

---

# 🧠 PADRÃO DE SERVIÇOS

Cada módulo deve conter:

```text
controller
service
repository
dto
entity
routes
validators
```

---

# 🚀 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

## Fase 1

- auth
- users
- organization
- members

## Fase 2

- mikrotik
- hotspot-plan
- hotspot-user

## Fase 3

- vouchers
- payments
- otp
- lgpd

---

# 📌 RISCOS E FALHAS COMUNS

## 1) Falta de tenant isolation

Risco crítico de vazamento entre clientes.

## 2) Password MikroTik sem criptografia

Sempre criptografar em repouso.

## 3) Vouchers sem transação

Use transação DB + compensação RouterOS.

## 4) Refresh tokens sem revogação

Sempre persistir e invalidar.

---

# ✅ RECOMENDAÇÕES PREVENTIVAS

- usar TypeORM custom repositories
- usar transactions em voucher batch
- usar filas para lotes grandes
- usar audit logs
- usar OpenAPI/Swagger
- usar testes E2E por módulo

---

# 📝 FLUXOS ADICIONAIS DE NEGÓCIO

## 👤 Registro de Usuário + Organização + Membership (Onboarding inicial)

### POST `/auth/register`

```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@surb.com",
  "cpf": "000.000.000-00",
  "password": "123456",
  "organizationName": "Empresa XPTO"
}
```

### Fluxo

1. criar `user`
2. criar `account` com password hash
3. criar `organization`
4. gerar slug
5. criar `member` com role `OWNER`
6. emitir JWT
7. retornar tenant inicial

### Regras

- email único
- cpf único
- slug único
- membership OWNER obrigatório

---

## 👥 Cadastro de Cliente (Customer)

> Cliente é o usuário final que pode consumir voucher, hotspot e login social.

### POST `/customers`

Fluxo:

1. criar user base
2. criar endereço opcional
3. registrar consentimento LGPD
4. associar à organização
5. opcionalmente criar hotspot user

### Casos de uso

- portal captive
- cadastro presencial
- landing page Wi-Fi marketing

---

## 🔐 Reset de Senha

### POST `/auth/forgot-password`

```json
{
  "email": "user@email.com"
}
```

### Fluxo

1. validar usuário
2. gerar token único
3. persistir token de reset
4. enviar email/SMS
5. expiração curta (15 min)

### POST `/auth/reset-password`

```json
{
  "token": "uuid-or-jwt",
  "newPassword": "novaSenha123"
}
```

### Fluxo

1. validar token
2. validar expiração
3. hash nova senha
4. atualizar `account.password_hash`
5. invalidar sessões antigas
6. revogar refresh tokens

---

## 📶 Cadastro de Usuário Hotspot

### POST `/hotspot-users/register`

```json
{
  "organizationId": "uuid",
  "mikrotikId": "uuid",
  "username": "cliente01",
  "password": "123456",
  "planId": "uuid"
}
```

### Fluxo

1. validar tenant
2. validar MikroTik online
3. validar plano
4. salvar `hotspot_user`
5. criar no RouterOS
6. sincronizar status
7. retornar credenciais

### Regras

- username único por tenant
- sincronização DB ↔ MikroTik
- rollback em falha RouterOS

---

# 🔐 MATRIZ RBAC — PAPÉIS X PERMISSÕES

## 🎭 Perfis do sistema

### OWNER

Acesso total ao tenant.

- billing
- membros
- mikrotiks
- vouchers
- lgpd
- configs
- auditoria

### ADMIN

Gestão operacional avançada.

- usuários
- hotspot
- vouchers
- planos
- mikrotik
- relatórios

### OPERATOR

Operação diária.

- gerar voucher
- bloquear hotspot user
- visualizar sessões
- suporte ao cliente

### CUSTOMER

Usuário final.

- login portal
- visualizar sessão
- aceitar LGPD
- reset senha
- auto cadastro

---

## 📋 Matriz por módulo

| Módulo       | OWNER | ADMIN   | OPERATOR    | CUSTOMER  |
| ------------ | ----- | ------- | ----------- | --------- |
| Auth         | ✅    | ✅      | ✅          | ✅        |
| Organization | ✅    | ❌      | ❌          | ❌        |
| Members      | ✅    | ✅      | ❌          | ❌        |
| Users        | ✅    | ✅      | ✅          | ⚠️ self   |
| Address      | ✅    | ✅      | ✅          | ⚠️ self   |
| MikroTik     | ✅    | ✅      | 👀 read     | ❌        |
| Hotspot Plan | ✅    | ✅      | 👀 read     | ❌        |
| Hotspot User | ✅    | ✅      | ✅          | 👀 self   |
| Voucher      | ✅    | ✅      | ✅ generate | 👀 redeem |
| OTP          | ✅    | ✅      | ✅          | ✅        |
| LGPD         | ✅    | ✅      | 👀 read     | ✅ self   |
| Payments     | ✅    | ✅      | ❌          | ❌        |
| Audit Logs   | ✅    | 👀 read | ❌          | ❌        |

Legenda:

- ✅ total
- 👀 leitura
- ⚠️ somente próprios dados

---

## 🧩 Middleware RBAC sugerido

```ts
requireRole(['OWNER', 'ADMIN']);
```

### Exemplo por rota

```ts
router.post(
  '/vouchers/generate',
  authMiddleware,
  tenantMiddleware,
  requireRole(['OWNER', 'ADMIN', 'OPERATOR']),
  controller.generate
);
```

---

## 🛡️ Regras críticas de autorização

### Tenant Scope obrigatório

Toda query deve filtrar por:

```ts
organizationId;
```

### Self Scope

CUSTOMER só pode acessar:

- próprio profile
- próprias sessões
- próprios consentimentos

### MikroTik Scope

Operador não altera credenciais do roteador.

---

## 📌 Recomendação técnica

Implementar decorators/helpers:

```ts
@RequireRole("OWNER")
@TenantScope()
@SelfOrAdmin()
```

Isso melhora:

- legibilidade
- reuso
- padronização
- testes

---

# 🎯 PRÓXIMO PASSO

Implementar módulos na seguinte ordem:

```text
auth → organization → users → members → mikrotik → plans → vouchers
```

Isso reduz dependências cíclicas e acelera MVP.
