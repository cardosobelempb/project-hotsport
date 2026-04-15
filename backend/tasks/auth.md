# Tasks — Módulo `auth`

> **Caminho:** `src/modulos/auth/`

---

## 1. Infrastructure — Controllers

- [ ] Revisar `auth-login.controller.ts` — extrair validação para schema Zod
- [ ] Revisar `auth-register.controller.ts` — garantir retorno de `OutputDto` (não model Prisma)
- [ ] Revisar `auth-session.controller.ts` — validar leitura de cookie/header JWT

## 2. Infrastructure — Routes

- [ ] Revisar `auth.routes.ts` — garantir `tags` e `summary` em todas as rotas (Swagger)

## 3. Presentation — Presenters

- [ ] Revisar `auth-login.present.ts` — padronizar estrutura do presenter
- [ ] Revisar `auth-register.present.ts` — padronizar estrutura do presenter
- [ ] Revisar `auth-session.present.ts` — padronizar estrutura do presenter

## 4. Application — Use Cases

- [ ] Refatorar `auth-login.use-case.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `auth-register.use-case.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Refatorar `auth-session.use-case.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`
- [ ] Consolidar ou remover `AuthUserUseCase.ts` (duplicidade com `auth-login.use-case.ts`)
- [ ] Mover `CreateOtpAuditLog.ts` para o módulo `otp`
- [ ] Mover `JwtTokenUseCase.ts` para `providers/token/`
- [ ] Mover `RequestOtp.ts` para o módulo `otp`
- [ ] Mover `VerifyOtp.ts` para o módulo `otp`

## 5. Domain

- [ ] Corrigir typo na pasta `domain/erros/` → renomear para `domain/errors/`
- [ ] Revisar `EmailAlreadyExistsError.ts` — estender `AppError` de `shared/errors/`
- [ ] Revisar `account.entity.ts` — garantir uso de value objects
- [ ] Revisar `token.entity.ts` + `token.props.ts` — consolidar em uma entidade
- [ ] Revisar `user-with-account.entity.ts` — avaliar se é entidade ou DTO

## 6. Arquitetura

- [ ] Padronizar camada: mover de `infrastructure/` para `presentation/` (alinhar com demais módulos)
- [ ] Criar `application/mappers/` separada (extrair mappers dos use cases)
