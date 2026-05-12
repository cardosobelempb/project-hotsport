**✅ Entregue!**

Aqui está o arquivo Markdown completo, seguindo **exatamente** o modelo que você enviou, com classes abstratas bem estruturadas, separadas por seções (`BUSCAS`, `EXISTÊNCIA`, `CONTAGENS`, `OUTROS`), comentários didáticos e baseadas 100% no schema Prisma.

````markdown
# Repositórios Abstratos - api-mikhmon

**Padrão:** Abstract Class + PageRepository  
**Base:** Schema Prisma completo  
**Objetivo:** Contrato claro, rico e padronizado para Use Cases e Controllers

---

## 1. IDENTITY_ACCESS

### UserRepository

```typescript
/**
 * Repositório abstrato de User.
 * Gerencia operações de usuários do sistema (autenticação, perfil e soft delete).
 */
export abstract class UserRepository extends PageRepository<UserEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<UserEntity | null>;
  abstract findActiveByEmail(email: string): Promise<UserEntity | null>;
  abstract findActiveByIdWithProfile(id: string): Promise<UserEntity | null>;
  abstract findWithRelations(id: string): Promise<UserEntity | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsActiveById(id: string): Promise<boolean>;
  abstract existsActiveByEmail(email: string): Promise<boolean>;

  // ====================== CONTAGENS ======================
  abstract countActiveByTenant(tenantId: string): Promise<number>;

  // ====================== OUTROS ======================
  abstract changePassword(id: string, passwordHash: string): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract restore(id: string): Promise<void>;
}
```
````

### UserProfileRepository

```typescript
/**
 * Repositório abstrato de UserProfile.
 * Gerencia o perfil detalhado do usuário (dados pessoais, avatar, documentos).
 */
export abstract class UserProfileRepository extends PageRepository<UserProfileEntity> {
  // ====================== BUSCAS ======================
  abstract findByUserId(userId: string): Promise<UserProfileEntity | null>;
  abstract findByDocumentNumber(
    document: string
  ): Promise<UserProfileEntity | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsByDocumentNumber(document: string): Promise<boolean>;

  // ====================== OUTROS ======================
  abstract upsert(
    userId: string,
    data: UpsertProfileInput
  ): Promise<UserProfileEntity>;
  abstract updateAvatar(
    userId: string,
    avatarUrl: string
  ): Promise<UserProfileEntity>;
}
```

### TokenRepository

```typescript
/**
 * Repositório abstrato de Token.
 * Gerencia tokens internos (refresh, reset password, API keys, etc).
 */
export abstract class TokenRepository extends PageRepository<TokenEntity> {
  // ====================== BUSCAS ======================
  abstract findValidByUserAndType(
    userId: string,
    type: TokenType
  ): Promise<TokenEntity | null>;
  abstract findByValueHash(valueHash: string): Promise<TokenEntity | null>;

  // ====================== OUTROS ======================
  abstract revokeToken(valueHash: string): Promise<void>;
  abstract revokeAllByUser(userId: string): Promise<void>;
  abstract expireToken(id: string): Promise<void>;
}
```

---

## 2. MULTI-TENANT / SAAS

### TenantRepository

```typescript
/**
 * Repositório abstrato de Tenant.
 * Gerencia os tenants (empresas/saas) do sistema multi-tenant.
 */
export abstract class TenantRepository extends PageRepository<TenantEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<TenantEntity | null>;
  abstract findActiveBySlug(slug: string): Promise<TenantEntity | null>;
  abstract findActiveByDocument(document: string): Promise<TenantEntity | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsActiveBySlug(slug: string): Promise<boolean>;
  abstract existsActiveByDocument(document: string): Promise<boolean>;

  // ====================== OUTROS ======================
  abstract changeStatus(
    id: string,
    status: TenantStatus
  ): Promise<TenantEntity>;
}
```

### OrganizationRepository

```typescript
/**
 * Repositório abstrato de Organization.
 * Define o contrato para todas as operações relacionadas a Organizações no sistema SaaS.
 */
export abstract class OrganizationRepository extends PageRepository<OrganizationEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<OrganizationEntity | null>;
  abstract findActiveBySlug(slug: string): Promise<OrganizationEntity | null>;
  abstract findActiveByDocument(
    document: string
  ): Promise<OrganizationEntity | null>;
  abstract findBySlugAndAccountId(
    slug: string,
    accountId: string
  ): Promise<OrganizationEntity | null>;
  abstract findWithConfigs(id: string): Promise<OrganizationEntity | null>;
  abstract findWithMikrotiks(id: string): Promise<OrganizationEntity | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsActiveById(id: string): Promise<boolean>;
  abstract existsActiveByDocument(document: string): Promise<boolean>;
  abstract existsActiveBySlug(slug: string): Promise<boolean>;
  abstract existsBySlugAndAccountId(
    slug: string,
    accountId: string
  ): Promise<boolean>;

  // ====================== CONTAGENS ======================
  abstract countActiveByTenant(tenantId: string): Promise<number>;
  abstract countByTenant(tenantId: string): Promise<number>;

  // ====================== OUTROS ======================
  abstract changeStatus(
    id: string,
    status: OrganizationStatus
  ): Promise<OrganizationEntity>;
}
```

### MembershipRepository

```typescript
/**
 * Repositório abstrato de Membership.
 * Gerencia associações entre usuários, tenants e organizações (papéis e permissões).
 */
export abstract class MembershipRepository extends PageRepository<MembershipEntity> {
  // ====================== BUSCAS ======================
  abstract findByUserAndTenant(
    userId: string,
    tenantId: string
  ): Promise<MembershipEntity | null>;
  abstract findByUserAndOrganization(
    userId: string,
    organizationId: string
  ): Promise<MembershipEntity | null>;
  abstract listByOrganization(
    organizationId: string,
    filters?: any
  ): Promise<MembershipEntity[]>;

  // ====================== OUTROS ======================
  abstract changeRole(
    memberId: string,
    role: MembershipRole
  ): Promise<MembershipEntity>;
  abstract removeMember(memberId: string): Promise<void>;
  abstract acceptInvitation(memberId: string): Promise<MembershipEntity>;
}
```

## 3. INFRAESTRUTURA MIKROTIK / HOTSPOT

### MikrotikRepository

```typescript
/**
 * Repositório abstrato de Mikrotik.
 * Gerencia dispositivos MikroTik vinculados às organizações.
 */
export abstract class MikrotikRepository extends PageRepository<MikrotikEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<MikrotikEntity | null>;
  abstract findByOrganization(
    organizationId: string
  ): Promise<MikrotikEntity[]>;

  // ====================== OUTROS ======================
  abstract updateStatus(
    id: string,
    status: MikrotikStatus
  ): Promise<MikrotikEntity>;
  abstract updateCredentials(
    id: string,
    username: string,
    passwordHash: string
  ): Promise<MikrotikEntity>;
}
```

### HotspotPlanRepository

```typescript
/**
 * Repositório abstrato de HotspotPlan.
 * Gerencia planos de hotspot (tempo, dados, ilimitado).
 */
export abstract class HotspotPlanRepository extends PageRepository<HotspotPlanEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveById(id: string): Promise<HotspotPlanEntity | null>;
  abstract listActiveByOrganization(
    organizationId: string
  ): Promise<HotspotPlanEntity[]>;

  // ====================== EXISTÊNCIA ======================
  abstract existsActiveByName(
    organizationId: string,
    name: string
  ): Promise<boolean>;
}
```

### HotspotUserRepository

```typescript
/**
 * Repositório abstrato de HotspotUser.
 * Gerencia usuários de hotspot (autenticação no MikroTik).
 */
export abstract class HotspotUserRepository extends PageRepository<HotspotUserEntity> {
  // ====================== BUSCAS ======================
  abstract findByUsername(
    organizationId: string,
    username: string
  ): Promise<HotspotUserEntity | null>;
  abstract findByMacAddress(mac: string): Promise<HotspotUserEntity | null>;

  // ====================== OUTROS ======================
  abstract blockUser(id: string): Promise<HotspotUserEntity>;
  abstract syncWithMikrotik(id: string): Promise<void>;
}
```

### VoucherRepository

```typescript
/**
 * Repositório abstrato de Voucher.
 * Gerencia vouchers/códigos de acesso para hotspot.
 */
export abstract class VoucherRepository extends PageRepository<VoucherEntity> {
  // ====================== BUSCAS ======================
  abstract findByCode(code: string): Promise<VoucherEntity | null>;
  abstract listAvailableByOrganization(
    organizationId: string
  ): Promise<VoucherEntity[]>;

  // ====================== OUTROS ======================
  abstract createBatch(data: CreateBatchVoucherInput): Promise<VoucherEntity[]>;
  abstract useVoucher(
    code: string,
    hotspotUserId?: string
  ): Promise<VoucherEntity>;
}
```

---

## 4. PAGAMENTOS E ASSINATURAS

### SubscriptionPlanRepository

```typescript
/**
 * Repositório abstrato de SubscriptionPlan.
 * Gerencia planos de assinatura SaaS.
 */
export abstract class SubscriptionPlanRepository extends PageRepository<SubscriptionPlanEntity> {
  // ====================== BUSCAS ======================
  abstract listPublicPlans(): Promise<SubscriptionPlanEntity[]>;
  abstract findActiveByCode(
    code: string
  ): Promise<SubscriptionPlanEntity | null>;
}
```

### SubscriptionRepository

```typescript
/**
 * Repositório abstrato de Subscription.
 * Gerencia assinaturas ativas das organizações.
 */
export abstract class SubscriptionRepository extends PageRepository<SubscriptionEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveByOrganization(
    organizationId: string
  ): Promise<SubscriptionEntity | null>;

  // ====================== OUTROS ======================
  abstract cancel(subscriptionId: string): Promise<SubscriptionEntity>;
  abstract renew(subscriptionId: string): Promise<SubscriptionEntity>;
}
```

### PaymentRepository

```typescript
/**
 * Repositório abstrato de Payment.
 * Gerencia transações de pagamento.
 */
export abstract class PaymentRepository extends PageRepository<PaymentEntity> {
  // ====================== BUSCAS ======================
  abstract findByProviderTransactionId(
    providerId: string
  ): Promise<PaymentEntity | null>;
  abstract listByOrganization(
    organizationId: string,
    filters?: any
  ): Promise<PaymentEntity[]>;

  // ====================== OUTROS ======================
  abstract updateStatus(
    paymentId: string,
    status: PaymentStatus
  ): Promise<PaymentEntity>;
}
```

---

## 5. PORTAL E MARKETING

### PortalRepository

```typescript
/**
 * Repositório abstrato de Portal.
 * Gerencia portais de captura/hotspot das organizações.
 */
export abstract class PortalRepository extends PageRepository<PortalEntity> {
  // ====================== BUSCAS ======================
  abstract findByOrganization(
    organizationId: string
  ): Promise<PortalEntity | null>;
  abstract findActiveBySlug(slug: string): Promise<PortalEntity | null>;

  // ====================== OUTROS ======================
  abstract activateCampaign(
    portalId: string,
    campaignId: string
  ): Promise<PortalEntity>;
}
```

### LeadRepository

```typescript
/**
 * Repositório abstrato de Lead.
 * Gerencia leads capturados pelos portais.
 */
export abstract class LeadRepository extends PageRepository<LeadEntity> {
  // ====================== BUSCAS ======================
  abstract findByEmailOrPhone(
    email?: string,
    phone?: string
  ): Promise<LeadEntity | null>;

  // ====================== OUTROS ======================
  abstract updateStatus(
    leadId: string,
    status: LeadStatus
  ): Promise<LeadEntity>;
  abstract convertToCustomer(leadId: string): Promise<void>;
}
```

**✅ Continuação Entregue!**

Aqui está a **continuação** do documento Markdown com mais entidades importantes do schema Prisma, seguindo exatamente o mesmo padrão e qualidade.

---

````markdown
# Repositórios Abstratos - api-mikhmon (Continuação)

**Padrão:** Abstract Class + PageRepository  
**Base:** Schema Prisma completo

---

## 6. ENDEREÇOS E LOCALIZAÇÃO

### AddressRepository

```typescript
/**
 * Repositório abstrato de Address.
 * Gerencia endereços de usuários, tenants e organizações.
 */
export abstract class AddressRepository extends PageRepository<AddressEntity> {
  // ====================== BUSCAS ======================
  abstract findByUserId(userId: string): Promise<AddressEntity[]>;
  abstract findByOrganizationId(
    organizationId: string
  ): Promise<AddressEntity[]>;
  abstract findByTenantId(tenantId: string): Promise<AddressEntity[]>;
  abstract findPrimaryByUser(userId: string): Promise<AddressEntity | null>;

  // ====================== EXISTÊNCIA ======================
  abstract existsPrimaryByUser(userId: string): Promise<boolean>;

  // ====================== OUTROS ======================
  abstract setAsPrimary(addressId: string): Promise<AddressEntity>;
  abstract findByCityAndState(
    cityId: string,
    stateId: string
  ): Promise<AddressEntity[]>;
}
```
````

### StateRepository

```typescript
/**
 * Repositório abstrato de State.
 * Estados brasileiros (quase imutável - leitura principal).
 */
export abstract class StateRepository extends PageRepository<StateEntity> {
  // ====================== BUSCAS ======================
  abstract findByUf(uf: string): Promise<StateEntity | null>;
  abstract findByName(name: string): Promise<StateEntity | null>;
  abstract listAllActive(): Promise<StateEntity[]>;
}
```

### CityRepository

```typescript
/**
 * Repositório abstrato de City.
 * Cidades vinculadas a estados.
 */
export abstract class CityRepository extends PageRepository<CityEntity> {
  // ====================== BUSCAS ======================
  abstract findByNameAndState(
    name: string,
    stateId: string
  ): Promise<CityEntity | null>;
  abstract listByState(stateId: string): Promise<CityEntity[]>;
  abstract findBySubdomain(subdomain: string): Promise<CityEntity | null>;
}
```

---

## 7. CONFIGURAÇÕES DA ORGANIZAÇÃO

### OrganizationConfigRepository

```typescript
/**
 * Repositório abstrato de OrganizationConfig.
 * Configurações JSON flexíveis por tipo (MercadoPago, WhatsApp, Hotspot, etc).
 */
export abstract class OrganizationConfigRepository extends PageRepository<OrganizationConfigEntity> {
  // ====================== BUSCAS ======================
  abstract findByOrganizationAndType(
    organizationId: string,
    configType: OrganizationConfigType
  ): Promise<OrganizationConfigEntity | null>;

  abstract findAllByOrganization(
    organizationId: string
  ): Promise<OrganizationConfigEntity[]>;

  // ====================== EXISTÊNCIA ======================
  abstract existsByOrganizationAndType(
    organizationId: string,
    configType: OrganizationConfigType
  ): Promise<boolean>;

  // ====================== OUTROS ======================
  abstract upsertConfig(
    organizationId: string,
    configType: OrganizationConfigType,
    configJson: any
  ): Promise<OrganizationConfigEntity>;
}
```

### MercadoPagoConfigRepository

```typescript
/**
 * Repositório abstrato de MercadoPagoConfig.
 * Configurações específicas do Mercado Pago.
 */
export abstract class MercadoPagoConfigRepository extends PageRepository<MercadoPagoConfigEntity> {
  // ====================== BUSCAS ======================
  abstract findByOrganization(
    organizationId: string
  ): Promise<MercadoPagoConfigEntity | null>;

  // ====================== OUTROS ======================
  abstract updateEncryptedToken(
    organizationId: string,
    accessTokenEncrypted: string
  ): Promise<MercadoPagoConfigEntity>;
}
```

### EfiConfigRepository

```typescript
/**
 * Repositório abstrato de EfiConfig.
 * Configurações da Efí (antiga Gerencianet) - PIX e cobranças.
 */
export abstract class EfiConfigRepository extends PageRepository<EfiConfigEntity> {
  // ====================== BUSCAS ======================
  abstract findByOrganization(
    organizationId: string
  ): Promise<EfiConfigEntity | null>;
}
```

---

## 8. CAMPANHAS E PORTAL

### CampaignRepository

```typescript
/**
 * Repositório abstrato de Campaign.
 * Gerencia campanhas de marketing nos portais.
 */
export abstract class CampaignRepository extends PageRepository<CampaignEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveByOrganization(
    organizationId: string
  ): Promise<CampaignEntity[]>;
  abstract findWithItems(id: string): Promise<CampaignEntity | null>;

  // ====================== OUTROS ======================
  abstract incrementViews(id: string): Promise<void>;
  abstract activate(id: string): Promise<CampaignEntity>;
}
```

### CampaignItemRepository

```typescript
/**
 * Repositório abstrato de CampaignItem.
 * Itens de campanha (imagens, vídeos, etc).
 */
export abstract class CampaignItemRepository extends PageRepository<CampaignItemEntity> {
  // ====================== BUSCAS ======================
  abstract listByCampaign(campaignId: string): Promise<CampaignItemEntity[]>;

  // ====================== OUTROS ======================
  abstract reorderItems(
    campaignId: string,
    newOrder: { id: string; order: number }[]
  ): Promise<void>;
}
```

---

## 9. LGPD E LOGS OPERACIONAIS

### LgpdConsentRepository

```typescript
/**
 * Repositório abstrato de LgpdConsent.
 * Gerencia consentimentos LGPD dos usuários.
 */
export abstract class LgpdConsentRepository extends PageRepository<LgpdConsentEntity> {
  // ====================== BUSCAS ======================
  abstract findActiveByUser(userId: string): Promise<LgpdConsentEntity | null>;

  // ====================== OUTROS ======================
  abstract withdrawConsent(userId: string): Promise<LgpdConsentEntity>;
  abstract updateConsents(
    userId: string,
    consents: any
  ): Promise<LgpdConsentEntity>;
}
```

### ConnectionLogRepository

```typescript
/**
 * Repositório abstrato de ConnectionLog.
 * Logs de conexões de hotspot (MikroTik).
 */
export abstract class ConnectionLogRepository extends PageRepository<ConnectionLogEntity> {
  // ====================== BUSCAS ======================
  abstract listByOrganization(
    organizationId: string,
    filters: { startDate?: Date; endDate?: Date; username?: string }
  ): Promise<ConnectionLogEntity[]>;

  // ====================== OUTROS ======================
  abstract logConnection(
    data: CreateConnectionLogInput
  ): Promise<ConnectionLogEntity>;
}
```

### WhatsappLogRepository

```typescript
/**
 * Repositório abstrato de WhatsappLog.
 * Logs de envios de mensagens WhatsApp.
 */
export abstract class WhatsappLogRepository extends PageRepository<WhatsappLogEntity> {
  // ====================== BUSCAS ======================
  abstract listByOrganization(
    organizationId: string,
    filters?: any
  ): Promise<WhatsappLogEntity[]>;

  // ====================== OUTROS ======================
  abstract logMessage(data: CreateWhatsappLogInput): Promise<WhatsappLogEntity>;
}
```

---

## 10. ENTIDADES AUXILIARES (Sistema)

### UpdateRepository

```typescript
/**
 * Repositório abstrato de Update.
 * Gerencia updates e migrations do sistema.
 */
export abstract class UpdateRepository extends PageRepository<UpdateEntity> {
  abstract findLatest(): Promise<UpdateEntity | null>;
  abstract markAsApplied(updateId: string): Promise<void>;
}
```
