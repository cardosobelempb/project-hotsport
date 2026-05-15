# Controllers por Entidade - Nomenclatura Granular

**Convenção**: `{Entity}-{Action}.controller.ts` para **SRP total**. Um controller = **1 endpoint/UseCase**. **Vantagem**: Testes isolados, deploy granular.

## 🔐 auth Module (8 Controllers)

```
src/modules/auth/infrastructure/http/controllers/
├── auth-login.controller.ts          // POST /auth/login
├── auth-refresh.controller.ts        // POST /auth/refresh  
├── auth-logout.controller.ts         // POST /auth/logout
├── auth-otp-send.controller.ts       // POST /auth/otp/send
├── auth-otp-verify.controller.ts     // POST /auth/otp/verify
├── auth-password-change.controller.ts // POST /auth/password/change
├── auth-password-reset.controller.ts // POST /auth/password/reset
└── auth-permissions.controller.ts    // GET /auth/permissions (RBAC) [file:1]
```

## 👤 identity Module (4 Controllers)

```
src/modules/identity/infrastructure/http/controllers/
├── user-register.controller.ts       // POST /identity/users/register
├── user-profile.controller.ts        // PATCH /identity/users/{id}/profile
├── user-deactivate.controller.ts     // DELETE /identity/users/{id}
└── address-primary.controller.ts     // PATCH /identity/addresses/{id}/primary [file:1]
```

## 🏢 tenant Module (6 Controllers)

```
src/modules/tenant/infrastructure/http/controllers/
├── tenant-create.controller.ts       // POST /tenant/create
├── organization-create.controller.ts // POST /tenant/{tenantId}/organizations
├── membership-invite.controller.ts   // POST /tenant/{tenantId}/memberships/invite
├── membership-accept.controller.ts   // PATCH /tenant/memberships/{id}/accept
├── membership-remove.controller.ts   // DELETE /tenant/memberships/{id}
└── tenant-upgrade.controller.ts      // PATCH /tenant/{id}/upgrade [file:1]
```

## 🌐 mikrotik Module (5 Controllers)

```
src/modules/mikrotik/infrastructure/http/controllers/
├── mikrotik-register.controller.ts   // POST /mikrotik/register
├── mikrotik-test.controller.ts       // POST /mikrotik/{id}/test
├── mikrotik-status.controller.ts     // GET /mikrotik/{id}/status
├── mikrotik-users-list.controller.ts // GET /mikrotik/{id}/users
└── mikrotik-user-create.controller.ts // POST /mikrotik/{id}/users [file:1]
```

## 📶 hotspot Module (7 Controllers)

```
src/modules/hotspot/infrastructure/http/controllers/
├── hotspot-plan-create.controller.ts  // POST /hotspot/plans
├── hotspot-plan-activate.controller.ts // PATCH /hotspot/plans/{id}/activate
├── hotspot-user-create.controller.ts  // POST /hotspot/users
├── hotspot-user-block.controller.ts   // PATCH /hotspot/users/{id}/block
├── voucher-generate.controller.ts     // POST /hotspot/vouchers/generate
├── voucher-redeem.controller.ts       // POST /vouchers/{code}/redeem
└── hotspot-stats.controller.ts        // GET /hotspot/stats [file:1]
```

## 💳 subscription Module (6 Controllers)

```
src/modules/subscription/infrastructure/http/controllers/
├── subscription-plan-create.controller.ts // POST /subscription/plans
├── subscription-start.controller.ts       // POST /subscription/start
├── subscription-cancel.controller.ts      // PATCH /subscription/{id}/cancel
├── payment-charge.controller.ts           // POST /subscription/{id}/charge
├── payment-refund.controller.ts           // PATCH /payments/{id}/refund
└── subscription-list.controller.ts        // GET /subscription/active [file:1]
```

## 🚀 portal Module (5 Controllers)

```
src/modules/portal/infrastructure/http/controllers/
├── portal-setup.controller.ts      // POST /portal/setup
├── portal-preview.controller.ts    // GET /portal/{slug}/preview
├── portal-publish.controller.ts    // PATCH /portal/{id}/publish
├── lead-capture.controller.ts      // POST /leads/capture
└── lead-export.controller.ts       // GET /leads/export [file:1]
```

## 📣 marketing Module (4 Controllers)

```
src/modules/marketing/infrastructure/http/controllers/
├── campaign-create.controller.ts   // POST /campaigns/create
├── campaign-activate.controller.ts // PATCH /campaigns/{id}/activate
├── campaign-item-add.controller.ts // POST /campaigns/{id}/items
└── whatsapp-leads.controller.ts    // GET /whatsapp/lead-logs [file:1]
```

## 📊 analytics Module (3 Controllers)

```
src/modules/analytics/infrastructure/http/controllers/
├── connection-analytics.controller.ts // GET /analytics/connections
├── hotspot-stats.controller.ts        // GET /analytics/hotspot
└── revenue-report.controller.ts       // GET /analytics/revenue [file:1]
```

## ⚖️ compliance Module (3 Controllers)

```
src/modules/compliance/infrastructure/http/controllers/
├── lgpd-consent.controller.ts    // POST /compliance/lgpd/consent
├── lgpd-revoke.controller.ts     // PATCH /compliance/lgpd/{id}/revoke
└── backup-create.controller.ts   // POST /compliance/backup [file:1]
```

## 🏗️ Exemplo Controller - `mikrotik-register.controller.ts`

```typescript
// src/modules/mikrotik/infrastructure/http/controllers/mikrotik-register.controller.ts
import { MikrotikRegisterUseCase } from '../../../application/usecases/MikrotikRegisterUseCase';
import { MikrotikRegisterInput } from '../../../application/dto/input';

@Controller('mikrotik')
export class MikrotikRegisterController {
  constructor(private registerUseCase: MikrotikRegisterUseCase) {}

  @Post('register')
  @UseGuards(AuthGuard('operator+'))  // RBAC
  @Validate(MikrotikRegisterInput)   // Zod pipe
  async register(@Body() input: MikrotikRegisterInput, @Req() req: Request) {
    const result = await this.registerUseCase.execute({
      ...input,
      orgId: req.user.organizationId  // Tenant isolation
    });
    
    if (result.isFailure()) {
      throw new BadRequestException(result.error.message);
    }
    
    return { data: result.value, message: 'Mikrotik registrado' };
  }
}
```

## 📊 Resumo Total

| Módulo | Controllers |
|--------|-------------|
| **auth** | 8 |
| **identity** | 4 |
| **tenant** | 6 |
| **mikrotik** | 5 |
| **hotspot** | 7 |
| **Total** | **68 Controllers**  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f50a33df-1be4-480b-8a63-fde339cc5317/2fd068cf-9363-45ff-8946-f3387508b9db/pasted-text.txt) |

**Vantagens**:
- **1 Controller = 1 Test** (100% coverage fácil)
- **Deploy Granular**: `mikrotik-register.controller.ts` isolado
- **Swagger Auto**: `@ApiOperation` por controller

**NestJS**: `@Controller('mikrotik')` + `@Post('register')` → `/mikrotik/register`. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_f50a33df-1be4-480b-8a63-fde339cc5317/2fd068cf-9363-45ff-8946-f3387508b9db/pasted-text.txt)