import { z } from "zod";

/\*

- Exemplos de DTOs e Schemas Zod para AGREGADOS com várias entidades.
-
- Objetivo deste arquivo:
- - Mostrar como representar um agregado DDD na camada de DTO.
- - Mostrar como validar entrada com Zod quando a operação envolve várias entidades.
- - Evitar controllers recebendo objetos soltos sem contrato claro.
- - Facilitar criação de use cases como:
- - CreateOrganizationAggregateUseCase
- - CreatePortalAggregateUseCase
- - CreateBillingAggregateUseCase
- - CreateHotspotAccessAggregateUseCase
-
- Regra prática:
- - DTO simples representa uma entidade.
- - DTO de agregado representa uma operação de negócio que envolve várias entidades.
-
- Exemplo:
- - Criar uma organização pode criar também:
- - usuário dono
- - membro owner
- - configuração do Mercado Pago
- - configuração EFI
- - portal padrão
- - template
- - campanha inicial
    \*/

// -----------------------------------------------------------------------------
// Helpers globais
// -----------------------------------------------------------------------------

export type SortDirection = "asc" | "desc";

export interface SearchPresentDto<TItem> {
items: TItem[];
total: number;
totalPages: number;
currentPage: number;
perPage: number;
sortBy: string | null;
sortDirection: SortDirection;
filter: string;
}

export const UuidSchema = z.string().uuid("ID inválido");
export const EmailSchema = z.string().email("E-mail inválido").max(255);
export const CpfSchema = z.string().min(11).max(14);
export const PhoneSchema = z.string().min(8).max(30);
export const CurrencySchema = z.string().length(3).transform((value) => value.toUpperCase());
export const MoneySchema = z.number().positive("Valor deve ser maior que zero");
export const SortDirectionSchema = z.enum(["asc", "desc"]);

export const PaginationSchema = z.object({
page: z.coerce.number().int().min(1).default(1),
perPage: z.coerce.number().int().min(1).max(100).default(20),
filter: z.string().trim().default(""),
});

export const createSearchPresentSchema = <TItem extends z.ZodTypeAny>(itemSchema: TItem) =>
z.object({
items: z.array(itemSchema),
total: z.number().int().min(0),
totalPages: z.number().int().min(0),
currentPage: z.number().int().min(1),
perPage: z.number().int().min(1),
sortBy: z.string().nullable(),
sortDirection: SortDirectionSchema,
filter: z.string(),
});

// -----------------------------------------------------------------------------
// Enums base
// -----------------------------------------------------------------------------

export type OrganizationStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "OPERATOR" | "HOTSPOT_USER";
export type MemberStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type MemberInvitationStatus = "ACTIVE" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "INVITED" | "PENDING" | "REMOVED";
export type Environment = "SANDBOX" | "PRODUCTION";
export type BillingCycle = "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "YEARLY";
export type PlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED" | "REFUNDED";
export type MikrotikStatus = "ONLINE" | "OFFLINE" | "ERROR";
export type HotspotPlanType = "TIME" | "DATA" | "UNLIMITED";
export type HotspotUserStatus = "ACTIVE" | "EXPIRED" | "BLOCKED" | "PENDING";
export type VoucherStatus = "UNUSED" | "ACTIVE" | "EXPIRED" | "REVOKED";
export type CampaignItemType = "IMAGE" | "VIDEO";
export type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "DISCARDED";

export const OrganizationStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]);
export const UserStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]);
export const MemberRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER", "OPERATOR", "HOTSPOT_USER"]);
export const MemberStatusSchema = z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]);
export const MemberInvitationStatusSchema = z.enum(["ACTIVE", "ACCEPTED", "DECLINED", "EXPIRED", "INVITED", "PENDING", "REMOVED"]);
export const EnvironmentSchema = z.enum(["SANDBOX", "PRODUCTION"]);
export const BillingCycleSchema = z.enum(["MONTHLY", "QUARTERLY", "SEMIANNUAL", "YEARLY"]);
export const PlanStatusSchema = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);
export const SubscriptionStatusSchema = z.enum(["TRIALING", "ACTIVE", "PAST_DUE", "SUSPENDED", "CANCELED", "EXPIRED"]);
export const PaymentStatusSchema = z.enum(["PENDING", "PAID", "FAILED", "CANCELED", "REFUNDED"]);
export const MikrotikStatusSchema = z.enum(["ONLINE", "OFFLINE", "ERROR"]);
export const HotspotPlanTypeSchema = z.enum(["TIME", "DATA", "UNLIMITED"]);
export const HotspotUserStatusSchema = z.enum(["ACTIVE", "EXPIRED", "BLOCKED", "PENDING"]);
export const VoucherStatusSchema = z.enum(["UNUSED", "ACTIVE", "EXPIRED", "REVOKED"]);
export const CampaignItemTypeSchema = z.enum(["IMAGE", "VIDEO"]);
export const LeadStatusSchema = z.enum(["NEW", "CONTACTED", "CONVERTED", "DISCARDED"]);

// =============================================================================
// 1. AGREGADO ORGANIZATION ONBOARDING
// =============================================================================

/\*

- Contexto:
- Ao cadastrar uma nova empresa no SaaS, normalmente não criamos apenas a
- Organization. Também criamos o usuário dono e o vínculo Member OWNER.
- Opcionalmente, já podemos criar configurações iniciais e portal padrão.
  \*/

export interface OrganizationCreateDto {
name: string;
slug: string;
logoUrl?: string | null;
status?: OrganizationStatus;
}

export interface OwnerUserCreateDto {
firstName: string;
lastName: string;
email: string;
cpf: string;
phoneNumber?: string | null;
password: string;
}

export interface InitialMercadoPagoConfigCreateDto {
publicKey?: string | null;
accessToken?: string | null;
clientId?: string | null;
clientSecret?: string | null;
webhookSecret?: string | null;
}

export interface InitialEfiConfigCreateDto {
clientId: string;
clientSecret: string;
pixKey: string;
environment?: Environment;
certificateName?: string | null;
}

export interface OrganizationOnboardingCreateDto {
organization: OrganizationCreateDto;
owner: OwnerUserCreateDto;
mercadoPagoConfig?: InitialMercadoPagoConfigCreateDto | null;
efiConfig?: InitialEfiConfigCreateDto | null;
createDefaultPortal?: boolean;
}

export interface OrganizationOnboardingPresentDto {
organization: {
id: string;
name: string;
slug: string;
logoUrl: string | null;
status: OrganizationStatus;
createdAt: Date;
};
owner: {
id: string;
firstName: string;
lastName: string;
fullName: string;
email: string;
cpf: string;
phoneNumber: string | null;
status: UserStatus;
};
member: {
id: string;
organizationId: string;
userId: string;
role: MemberRole;
status: MemberStatus;
invitationStatus: MemberInvitationStatus;
};
integrations: {
mercadoPagoConfigured: boolean;
efiConfigured: boolean;
};
}

export const OrganizationCreateSchema = z.object({
name: z.string().trim().min(2).max(100),
slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)\*$/, "Slug inválido"),
logoUrl: z.string().url().max(500).nullable().optional(),
status: OrganizationStatusSchema.default("ACTIVE").optional(),
}).strict();

export const OwnerUserCreateSchema = z.object({
firstName: z.string().trim().min(2).max(100),
lastName: z.string().trim().min(2).max(100),
email: EmailSchema,
cpf: CpfSchema,
phoneNumber: PhoneSchema.nullable().optional(),
password: z.string().min(8).max(72),
}).strict();

export const InitialMercadoPagoConfigCreateSchema = z.object({
publicKey: z.string().nullable().optional(),
accessToken: z.string().nullable().optional(),
clientId: z.string().nullable().optional(),
clientSecret: z.string().nullable().optional(),
webhookSecret: z.string().nullable().optional(),
}).strict();

export const InitialEfiConfigCreateSchema = z.object({
clientId: z.string().min(1),
clientSecret: z.string().min(1),
pixKey: z.string().min(1),
environment: EnvironmentSchema.default("SANDBOX").optional(),
certificateName: z.string().nullable().optional(),
}).strict();

export const OrganizationOnboardingCreateSchema = z.object({
organization: OrganizationCreateSchema,
owner: OwnerUserCreateSchema,
mercadoPagoConfig: InitialMercadoPagoConfigCreateSchema.nullable().optional(),
efiConfig: InitialEfiConfigCreateSchema.nullable().optional(),
createDefaultPortal: z.boolean().default(true).optional(),
}).strict().superRefine((data, ctx) => {
const hasMercadoPago = Boolean(data.mercadoPagoConfig?.accessToken);
const hasEfi = Boolean(data.efiConfig?.clientId && data.efiConfig?.clientSecret && data.efiConfig?.pixKey);

// Regra de exemplo: para produção comercial, pelo menos um gateway deve estar pronto.
// Em ambiente real, isso poderia ser uma regra opcional por plano/feature flag.
if (!hasMercadoPago && !hasEfi) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["mercadoPagoConfig"],
message: "Informe Mercado Pago ou EFI para habilitar cobrança automática.",
});
}
});

export const OrganizationOnboardingPresentSchema = z.object({
organization: z.object({
id: UuidSchema,
name: z.string(),
slug: z.string(),
logoUrl: z.string().nullable(),
status: OrganizationStatusSchema,
createdAt: z.date(),
}),
owner: z.object({
id: UuidSchema,
firstName: z.string(),
lastName: z.string(),
fullName: z.string(),
email: z.string(),
cpf: z.string(),
phoneNumber: z.string().nullable(),
status: UserStatusSchema,
}),
member: z.object({
id: UuidSchema,
organizationId: UuidSchema,
userId: UuidSchema,
role: MemberRoleSchema,
status: MemberStatusSchema,
invitationStatus: MemberInvitationStatusSchema,
}),
integrations: z.object({
mercadoPagoConfigured: z.boolean(),
efiConfigured: z.boolean(),
}),
});

// =============================================================================
// 2. AGREGADO BILLING: ASSINATURA + PAGAMENTO
// =============================================================================

/\*

- Contexto:
- Uma assinatura geralmente nasce junto com um pagamento inicial.
- O agregado abaixo evita que o controller receba Subscription e Payment separados.
  \*/

export interface SubscriptionPlanSummaryDto {
id: string;
code: string;
name: string;
billingCycle: BillingCycle;
amount: number;
currency: string;
}

export interface SubscriptionCreateDto {
organizationId: string;
subscriptionPlanId: string;
status?: SubscriptionStatus;
billingCycle: BillingCycle;
amount: number;
currency: string;
startsAt: Date;
currentPeriodStart: Date;
currentPeriodEnd: Date;
trialStartsAt?: Date | null;
trialEndsAt?: Date | null;
}

export interface InitialPaymentCreateDto {
amount: number;
currency: string;
provider: "mercado-pago" | "efi" | "manual";
description?: string | null;
dueAt?: Date | null;
payerEmail?: string | null;
}

export interface BillingSubscriptionAggregateCreateDto {
subscription: SubscriptionCreateDto;
payment: InitialPaymentCreateDto;
}

export interface BillingSubscriptionAggregatePresentDto {
subscription: {
id: string;
organizationId: string;
subscriptionPlanId: string;
status: SubscriptionStatus;
billingCycle: BillingCycle;
amount: number;
currency: string;
currentPeriodStart: Date;
currentPeriodEnd: Date;
createdAt: Date;
};
payment: {
id: string;
organizationId: string;
subscriptionId: string;
amount: number;
currency: string;
status: PaymentStatus;
provider: string | null;
providerTransactionId: string | null;
dueAt: Date | null;
createdAt: Date;
};
checkout?: {
checkoutUrl: string | null;
qrCode: string | null;
qrCodeBase64: string | null;
} | null;
}

export const SubscriptionCreateSchema = z.object({
organizationId: UuidSchema,
subscriptionPlanId: UuidSchema,
status: SubscriptionStatusSchema.default("ACTIVE").optional(),
billingCycle: BillingCycleSchema,
amount: MoneySchema,
currency: CurrencySchema,
startsAt: z.coerce.date(),
currentPeriodStart: z.coerce.date(),
currentPeriodEnd: z.coerce.date(),
trialStartsAt: z.coerce.date().nullable().optional(),
trialEndsAt: z.coerce.date().nullable().optional(),
}).strict();

export const InitialPaymentCreateSchema = z.object({
amount: MoneySchema,
currency: CurrencySchema,
provider: z.enum(["mercado-pago", "efi", "manual"]),
description: z.string().max(255).nullable().optional(),
dueAt: z.coerce.date().nullable().optional(),
payerEmail: EmailSchema.nullable().optional(),
}).strict();

export const BillingSubscriptionAggregateCreateSchema = z.object({
subscription: SubscriptionCreateSchema,
payment: InitialPaymentCreateSchema,
}).strict().superRefine((data, ctx) => {
if (data.subscription.currentPeriodEnd <= data.subscription.currentPeriodStart) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["subscription", "currentPeriodEnd"],
message: "A data final do período precisa ser maior que a data inicial.",
});
}

if (data.payment.amount !== data.subscription.amount) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["payment", "amount"],
message: "O valor do pagamento inicial deve ser igual ao valor da assinatura.",
});
}

if (data.payment.currency !== data.subscription.currency) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["payment", "currency"],
message: "A moeda do pagamento deve ser igual à moeda da assinatura.",
});
}

if (data.payment.provider !== "manual" && !data.payment.payerEmail) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["payment", "payerEmail"],
message: "Pagamentos por gateway precisam de e-mail do pagador.",
});
}
});

export const BillingSubscriptionAggregatePresentSchema = z.object({
subscription: z.object({
id: UuidSchema,
organizationId: UuidSchema,
subscriptionPlanId: UuidSchema,
status: SubscriptionStatusSchema,
billingCycle: BillingCycleSchema,
amount: z.number(),
currency: z.string(),
currentPeriodStart: z.date(),
currentPeriodEnd: z.date(),
createdAt: z.date(),
}),
payment: z.object({
id: UuidSchema,
organizationId: UuidSchema,
subscriptionId: UuidSchema,
amount: z.number(),
currency: z.string(),
status: PaymentStatusSchema,
provider: z.string().nullable(),
providerTransactionId: z.string().nullable(),
dueAt: z.date().nullable(),
createdAt: z.date(),
}),
checkout: z.object({
checkoutUrl: z.string().nullable(),
qrCode: z.string().nullable(),
qrCodeBase64: z.string().nullable(),
}).nullable().optional(),
});

// =============================================================================
// 3. AGREGADO PORTAL: PORTAL + TEMPLATE + CAMPANHA + ITENS
// =============================================================================

/\*

- Contexto:
- Criar um portal pode envolver template, campanha ativa e vários itens de mídia.
- Esse agregado representa uma operação completa de configuração do portal captive.
  \*/

export interface PortalTemplateCreateDto {
name: string;
description?: string | null;
thumbnailUrl?: string | null;
htmlTemplate: string;
cssTemplate?: string | null;
type?: string | null;
}

export interface CampaignItemCreateDto {
type: CampaignItemType;
order?: number;
fileUrl: string;
durationSeconds?: number;
title?: string | null;
destinationLink?: string | null;
}

export interface CampaignCreateWithItemsDto {
name: string;
description?: string | null;
isActive?: boolean;
items: CampaignItemCreateDto[];
}

export interface PortalCreateDto {
organizationId: string;
name: string;
slug: string;
type?: string | null;
redirectUrl?: string | null;
htmlContent?: string | null;
description?: string | null;
isActive?: boolean;
customCss?: string | null;
logoUrl?: string | null;
primaryColor?: string | null;
backgroundColor?: string | null;
registrationFields?: unknown | null;
showPlans?: boolean;
showLgpd?: boolean;
whatsappEnabled?: boolean;
whatsappTemplate?: string | null;
}

export interface PortalAggregateCreateDto {
portal: PortalCreateDto;
template?: PortalTemplateCreateDto | null;
campaign?: CampaignCreateWithItemsDto | null;
}

export interface PortalAggregatePresentDto {
portal: {
id: string;
organizationId: string;
name: string;
slug: string;
isActive: boolean;
showPlans: boolean;
showLgpd: boolean;
whatsappEnabled: boolean;
createdAt: Date;
};
template: {
id: string;
name: string;
type: string | null;
} | null;
campaign: {
id: string;
name: string;
isActive: boolean;
itemsCount: number;
} | null;
}

export const PortalTemplateCreateSchema = z.object({
name: z.string().trim().min(2).max(255),
description: z.string().nullable().optional(),
thumbnailUrl: z.string().url().max(500).nullable().optional(),
htmlTemplate: z.string().min(1),
cssTemplate: z.string().nullable().optional(),
type: z.string().max(50).default("basico").nullable().optional(),
}).strict();

export const CampaignItemCreateSchema = z.object({
type: CampaignItemTypeSchema,
order: z.number().int().min(0).default(0).optional(),
fileUrl: z.string().url().max(500),
durationSeconds: z.number().int().positive().default(5).optional(),
title: z.string().max(200).nullable().optional(),
destinationLink: z.string().url().max(500).nullable().optional(),
}).strict().superRefine((data, ctx) => {
if (data.type === "VIDEO" && !data.durationSeconds) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["durationSeconds"],
message: "Vídeos precisam de duração definida.",
});
}
});

export const CampaignCreateWithItemsSchema = z.object({
name: z.string().trim().min(2).max(150),
description: z.string().nullable().optional(),
isActive: z.boolean().default(true).optional(),
items: z.array(CampaignItemCreateSchema).min(1, "A campanha precisa de pelo menos um item."),
}).strict();

export const PortalCreateSchema = z.object({
organizationId: UuidSchema,
name: z.string().trim().min(2).max(100),
slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)\*$/, "Slug inválido"),
  type: z.string().max(50).default("basico").nullable().optional(),
  redirectUrl: z.string().url().max(500).nullable().optional(),
  htmlContent: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true).optional(),
  customCss: z.string().nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#3B82F6").nullable().optional(),
backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#0f111a").nullable().optional(),
registrationFields: z.unknown().nullable().optional(),
showPlans: z.boolean().default(false).optional(),
showLgpd: z.boolean().default(true).optional(),
whatsappEnabled: z.boolean().default(false).optional(),
whatsappTemplate: z.string().nullable().optional(),
}).strict();

export const PortalAggregateCreateSchema = z.object({
portal: PortalCreateSchema,
template: PortalTemplateCreateSchema.nullable().optional(),
campaign: CampaignCreateWithItemsSchema.nullable().optional(),
}).strict().superRefine((data, ctx) => {
if (data.portal.whatsappEnabled && !data.portal.whatsappTemplate) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["portal", "whatsappTemplate"],
message: "Template de WhatsApp é obrigatório quando WhatsApp estiver habilitado.",
});
}

if (!data.template && !data.portal.htmlContent) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["template"],
message: "Informe um template ou um HTML customizado para o portal.",
});
}
});

export const PortalAggregatePresentSchema = z.object({
portal: z.object({
id: UuidSchema,
organizationId: UuidSchema,
name: z.string(),
slug: z.string(),
isActive: z.boolean(),
showPlans: z.boolean(),
showLgpd: z.boolean(),
whatsappEnabled: z.boolean(),
createdAt: z.date(),
}),
template: z.object({
id: UuidSchema,
name: z.string(),
type: z.string().nullable(),
}).nullable(),
campaign: z.object({
id: UuidSchema,
name: z.string(),
isActive: z.boolean(),
itemsCount: z.number().int().min(0),
}).nullable(),
});

// =============================================================================
// 4. AGREGADO HOTSPOT: MIKROTIK + PLANO + VOUCHERS
// =============================================================================

/\*

- Contexto:
- Uma operação comum no domínio hotspot é criar um plano e já gerar vouchers
- para venda ou distribuição.
  \*/

export interface HotspotPlanCreateDto {
organizationId: string;
name: string;
type?: HotspotPlanType;
durationSecs?: number | null;
dataLimitMb?: number | null;
}

export interface VoucherBatchCreateDto {
mikrotikId: string;
quantity: number;
prefix?: string | null;
expiresAt?: Date | null;
}

export interface HotspotPlanWithVoucherBatchCreateDto {
plan: HotspotPlanCreateDto;
voucherBatch: VoucherBatchCreateDto;
}

export interface HotspotPlanWithVoucherBatchPresentDto {
plan: {
id: string;
organizationId: string;
name: string;
type: HotspotPlanType;
durationSecs: number | null;
dataLimitMb: number | null;
createdAt: Date;
};
vouchers: Array<{
id: string;
organizationId: string;
mikrotikId: string;
planId: string;
code: string;
status: VoucherStatus;
expiresAt: Date | null;
}>;
}

export const HotspotPlanCreateSchema = z.object({
organizationId: UuidSchema,
name: z.string().trim().min(2).max(120),
type: HotspotPlanTypeSchema.default("TIME").optional(),
durationSecs: z.number().int().positive().nullable().optional(),
dataLimitMb: z.number().int().positive().nullable().optional(),
}).strict().superRefine((data, ctx) => {
if (data.type === "TIME" && !data.durationSecs) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["durationSecs"],
message: "Plano por tempo precisa de durationSecs.",
});
}

if (data.type === "DATA" && !data.dataLimitMb) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["dataLimitMb"],
message: "Plano por dados precisa de dataLimitMb.",
});
}
});

export const VoucherBatchCreateSchema = z.object({
mikrotikId: UuidSchema,
quantity: z.number().int().min(1).max(1000),
prefix: z.string().min(2).max(10).nullable().optional(),
expiresAt: z.coerce.date().nullable().optional(),
}).strict();

export const HotspotPlanWithVoucherBatchCreateSchema = z.object({
plan: HotspotPlanCreateSchema,
voucherBatch: VoucherBatchCreateSchema,
}).strict();

export const HotspotPlanWithVoucherBatchPresentSchema = z.object({
plan: z.object({
id: UuidSchema,
organizationId: UuidSchema,
name: z.string(),
type: HotspotPlanTypeSchema,
durationSecs: z.number().nullable(),
dataLimitMb: z.number().nullable(),
createdAt: z.date(),
}),
vouchers: z.array(z.object({
id: UuidSchema,
organizationId: UuidSchema,
mikrotikId: UuidSchema,
planId: UuidSchema,
code: z.string(),
status: VoucherStatusSchema,
expiresAt: z.date().nullable(),
})),
});

// =============================================================================
// 5. AGREGADO CRM: LEAD + LGPD + WHATSAPP
// =============================================================================

/\*

- Contexto:
- Quando um visitante se cadastra no portal, geralmente precisamos:
- - criar Lead
- - registrar aceite LGPD
- - opcionalmente enviar mensagem WhatsApp
    \*/

export interface LeadCaptureCreateDto {
organizationId: string;
portalId?: string | null;
name?: string | null;
email?: string | null;
phone?: string | null;
cpf?: string | null;
mac?: string | null;
ip?: string | null;
source?: string | null;
observations?: string | null;
lgpd: {
accepted: boolean;
acceptedAt?: Date | null;
userAgent?: string | null;
consentVersion: string;
};
whatsapp?: {
enabled: boolean;
message?: string | null;
} | null;
}

export interface LeadCapturePresentDto {
lead: {
id: string;
organizationId: string;
name: string | null;
email: string | null;
phone: string | null;
cpf: string | null;
status: LeadStatus;
source: string | null;
lgpdAccepted: boolean;
createdAt: Date;
};
whatsappLog: {
id: string;
status: "OK" | "ERROR" | "SKIPPED";
} | null;
}

export const LeadCaptureCreateSchema = z.object({
organizationId: UuidSchema,
portalId: UuidSchema.nullable().optional(),
name: z.string().max(255).nullable().optional(),
email: EmailSchema.nullable().optional(),
phone: z.string().max(50).nullable().optional(),
cpf: z.string().max(20).nullable().optional(),
mac: z.string().max(50).nullable().optional(),
ip: z.string().max(50).nullable().optional(),
source: z.string().max(50).default("portal").nullable().optional(),
observations: z.string().nullable().optional(),
lgpd: z.object({
accepted: z.boolean(),
acceptedAt: z.coerce.date().nullable().optional(),
userAgent: z.string().max(500).nullable().optional(),
consentVersion: z.string().min(1).max(10),
}).strict(),
whatsapp: z.object({
enabled: z.boolean(),
message: z.string().nullable().optional(),
}).strict().nullable().optional(),
}).strict().superRefine((data, ctx) => {
if (!data.email && !data.phone && !data.cpf) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["email"],
message: "Informe pelo menos e-mail, telefone ou CPF para identificar o lead.",
});
}

if (!data.lgpd.accepted) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["lgpd", "accepted"],
message: "O aceite LGPD é obrigatório para captura do lead.",
});
}

if (data.whatsapp?.enabled && !data.phone) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
path: ["phone"],
message: "Telefone é obrigatório para envio de WhatsApp.",
});
}
});

export const LeadCapturePresentSchema = z.object({
lead: z.object({
id: UuidSchema,
organizationId: UuidSchema,
name: z.string().nullable(),
email: z.string().nullable(),
phone: z.string().nullable(),
cpf: z.string().nullable(),
status: LeadStatusSchema,
source: z.string().nullable(),
lgpdAccepted: z.boolean(),
createdAt: z.date(),
}),
whatsappLog: z.object({
id: UuidSchema,
status: z.enum(["OK", "ERROR", "SKIPPED"]),
}).nullable(),
});

// =============================================================================
// 6. EXEMPLO DE USO EM CONTROLLER FASTIFY
// =============================================================================

/\*
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const createOrganizationOnboardingController =
(useCase: { execute(input: OrganizationOnboardingCreateDto): Promise<OrganizationOnboardingPresentDto> }) => {
return async (app: FastifyInstance): Promise<void> => {
app.withTypeProvider<ZodTypeProvider>().route({
method: "POST",
url: "/organizations/onboarding",
schema: {
tags: ["Organization"],
summary: "Cria organização com usuário dono e integrações iniciais",
body: OrganizationOnboardingCreateSchema,
response: {
201: OrganizationOnboardingPresentSchema,
},
},
handler: async (request, reply) => {
// request.body já está validado pelo Zod.
const result = await useCase.execute(request.body);

          return reply.status(201).send(result);
        },
      });
    };

};
\*/

// =============================================================================
// 7. EXEMPLO DE MAPPER PARA AGREGADO
// =============================================================================

/\*

- Mapper evita que o controller conheça entidades de domínio ou modelos Prisma.
- Ele transforma entidades internas em DTO seguro de saída.
  \*/

export interface OrganizationOnboardingMapperInput {
organization: {
id: string;
name: string;
slug: string;
logoUrl: string | null;
status: OrganizationStatus;
createdAt: Date;
};
owner: {
id: string;
firstName: string;
lastName: string;
email: string;
cpf: string;
phoneNumber: string | null;
status: UserStatus;
};
member: {
id: string;
organizationId: string;
userId: string;
role: MemberRole;
status: MemberStatus;
invitationStatus: MemberInvitationStatus;
};
mercadoPagoConfig?: unknown | null;
efiConfig?: unknown | null;
}

export class OrganizationOnboardingMapper {
static toPresent(input: OrganizationOnboardingMapperInput): OrganizationOnboardingPresentDto {
return {
organization: {
id: input.organization.id,
name: input.organization.name,
slug: input.organization.slug,
logoUrl: input.organization.logoUrl,
status: input.organization.status,
createdAt: input.organization.createdAt,
},
owner: {
id: input.owner.id,
firstName: input.owner.firstName,
lastName: input.owner.lastName,
fullName: `${input.owner.firstName} ${input.owner.lastName}`,
email: input.owner.email,
cpf: input.owner.cpf,
phoneNumber: input.owner.phoneNumber,
status: input.owner.status,
},
member: {
id: input.member.id,
organizationId: input.member.organizationId,
userId: input.member.userId,
role: input.member.role,
status: input.member.status,
invitationStatus: input.member.invitationStatus,
},
integrations: {
mercadoPagoConfigured: Boolean(input.mercadoPagoConfig),
efiConfigured: Boolean(input.efiConfig),
},
};
}
}

// =============================================================================
// 8. PADRÃO RECOMENDADO DE PASTAS PARA AGREGADOS
// =============================================================================

/_
src/modules
├── organization
│ └── application
│ └── usecases
│ └── create-organization-onboarding.usecase.ts
│ └── http
│ ├── controllers
│ │ └── create-organization-onboarding.controller.ts
│ ├── dtos
│ │ └── organization-onboarding.dto.ts
│ └── schemas
│ └── organization-onboarding.schema.ts
│
├── billing
│ └── application
│ └── usecases
│ └── create-subscription-with-payment.usecase.ts
│ └── http
│ ├── dtos
│ │ └── billing-subscription-aggregate.dto.ts
│ └── schemas
│ └── billing-subscription-aggregate.schema.ts
│
├── portal
│ └── application
│ └── usecases
│ └── create-portal-aggregate.usecase.ts
│
└── hotspot
└── application
└── usecases
└── create-plan-with-vouchers.usecase.ts
_/
