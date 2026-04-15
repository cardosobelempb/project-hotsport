# Tasks — Módulo `otp`

> **Caminho:** `src/modulos/otp/`
> **Propósito:** geração e verificação de OTP (One-Time Password) para autenticação.

---

## 1. Presentation — Controllers (a criar)

- [ ] Criar `presentation/controllers/request-otp.controller.ts`
- [ ] Criar `presentation/controllers/verify-otp.controller.ts`

## 2. Application — Use Cases (a mover de `auth`)

- [ ] Mover `RequestOtp.ts` de `auth/usecases/` para `otp/application/usecases/`
- [ ] Mover `VerifyOtp.ts` de `auth/usecases/` para `otp/application/usecases/`
- [ ] Mover `CreateOtpAuditLog.ts` de `auth/usecases/` para `otp/application/usecases/`
- [ ] Refatorar todos — sem `try/catch`, retornar `Either<Error, OutputDto>`

## 3. Domain

- [ ] Revisar `otp.entity.ts` — garantir uso de value objects e expiração
- [ ] Criar `domain/errors/OtpExpiredError.ts`
- [ ] Criar `domain/errors/OtpInvalidError.ts`
- [ ] Criar `domain/repositories/otp.repository.ts` (interface)

## 4. Arquitetura

- [ ] Criar `infrastructure/repositories/otp.repo.ts` com implementação Prisma
- [ ] Criar `infrastructure/routes/otp.routes.ts` com `tags` e `summary` (Swagger)
