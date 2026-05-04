-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('owner', 'admin', 'manager', 'support', 'finance', 'member');

-- CreateEnum
CREATE TYPE "MemberInvitationStatus" AS ENUM ('active', 'accepted', 'declined', 'expired', 'invited', 'pending', 'removed');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('active', 'invited', 'suspended', 'removed');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('password', 'oauth', 'otp');

-- CreateEnum
CREATE TYPE "AccountProvider" AS ENUM ('email', 'google', 'facebook', 'apple');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('trialing', 'active', 'suspended', 'canceled');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('refresh', 'access');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('active', 'inactive', 'blocked', 'deleted');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('home', 'work', 'billing', 'other');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('sandbox', 'production');

-- CreateEnum
CREATE TYPE "MikrotikStatus" AS ENUM ('online', 'offline', 'error');

-- CreateEnum
CREATE TYPE "HotspotPlanType" AS ENUM ('time', 'data', 'unlimited');

-- CreateEnum
CREATE TYPE "HotspotUserStatus" AS ENUM ('active', 'expired', 'blocked', 'pending');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('unused', 'active', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('active', 'revoked', 'withdrawn');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'suspended', 'canceled', 'expired');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('mensal', 'trimestral', 'semestral', 'anual');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pendente', 'pago', 'falhou', 'cancelado', 'reembolsado');

-- CreateEnum
CREATE TYPE "CampaignItemType" AS ENUM ('imagem', 'video');

-- CreateEnum
CREATE TYPE "OrganizationConfigType" AS ENUM ('mercadopago', 'efi', 'whatsapp');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('novo', 'contactado', 'convertido', 'descartado');

-- CreateEnum
CREATE TYPE "UpdateFileAction" AS ENUM ('create', 'update', 'delete');

-- CreateEnum
CREATE TYPE "UpdateApplyLogStatus" AS ENUM ('info', 'ok', 'error', 'skipped');

-- CreateEnum
CREATE TYPE "SystemBackupType" AS ENUM ('pre_update', 'manual');

-- CreateEnum
CREATE TYPE "WhatsappLogStatus" AS ENUM ('info', 'ok', 'error', 'skipped');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('cpf', 'cnpj', 'rg', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "document_type" "DocumentType",
    "document_number" VARCHAR(30),
    "contact_email" VARCHAR(255),
    "phone" VARCHAR(20),
    "status" "AccountStatus" NOT NULL DEFAULT 'trialing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "document_type" "DocumentType",
    "document_number" VARCHAR(30),
    "contact_email" VARCHAR(255),
    "phone" VARCHAR(20),
    "logo_url" VARCHAR(500),
    "status" "OrganizationStatus" NOT NULL DEFAULT 'active',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'member',
    "status" "MemberStatus" NOT NULL DEFAULT 'active',
    "invited_by" UUID,
    "joined_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'home',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "street" VARCHAR(255) NOT NULL,
    "number" VARCHAR(20) NOT NULL,
    "complement" VARCHAR(100),
    "neighborhood" VARCHAR(100) NOT NULL,
    "state_id" UUID,
    "city_id" UUID,
    "country" CHAR(2) NOT NULL DEFAULT 'BR',
    "zip_code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "TokenType" NOT NULL DEFAULT 'access',
    "value_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "phone" VARCHAR(30) NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_mercadopago" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "public_key" TEXT,
    "access_token" TEXT,
    "client_id" TEXT,
    "client_secret" TEXT,
    "webhookSecret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "config_mercadopago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "efi_config" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "pixKey" TEXT NOT NULL,
    "environment" "Environment" NOT NULL DEFAULT 'sandbox',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "efi_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mikrotiks" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 8728,
    "mac_address" VARCHAR(20) NOT NULL,
    "ip_address" VARCHAR(15) NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active_user" BOOLEAN NOT NULL DEFAULT false,
    "status" "MikrotikStatus" NOT NULL DEFAULT 'offline',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "mikrotiks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotspot_plans" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HotspotPlanType" NOT NULL DEFAULT 'time',
    "durationSecs" INTEGER,
    "dataLimitMb" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "hotspot_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotspot_users" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "mikrotikId" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "mac_address" VARCHAR(20) NOT NULL,
    "ip_address" VARCHAR(15) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "HotspotUserStatus" NOT NULL DEFAULT 'pending',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "hotspot_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "mikrotik_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'unused',
    "used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_consents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "consent_terms" BOOLEAN NOT NULL,
    "consent_marketing" BOOLEAN NOT NULL,
    "consent_data_sharing" BOOLEAN NOT NULL,
    "consent_analytics" BOOLEAN NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "mac_address" VARCHAR(20) NOT NULL,
    "user_agent" VARCHAR(500) NOT NULL,
    "consent_version" VARCHAR(10) NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'active',
    "withdrawn_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "lgpd_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "status" "PlanStatus" NOT NULL DEFAULT 'active',
    "billing_cycle" "BillingCycle" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "trial_days" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "subscription_plan_id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "billing_cycle" "BillingCycle" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "trial_starts_at" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "starts_at" TIMESTAMP(3) NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "canceled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pendente',
    "provider" VARCHAR(50),
    "provider_transaction_id" VARCHAR(255),
    "description" VARCHAR(255),
    "due_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_items" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "type" "CampaignItemType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "file_url" VARCHAR(500) NOT NULL,
    "duration_seconds" INTEGER NOT NULL DEFAULT 5,
    "title" VARCHAR(200),
    "destination_link" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_configs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "config_type" "OrganizationConfigType" NOT NULL,
    "config_json" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "organization_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_vpn_peers" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "wg_client_id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_vpn_peers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portals" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "active_campaign_id" UUID,
    "template_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "type" VARCHAR(50) DEFAULT 'basico',
    "redirect_url" VARCHAR(500),
    "html_content" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "custom_css" TEXT,
    "logo_url" VARCHAR(500),
    "primary_color" VARCHAR(7) DEFAULT '#3B82F6',
    "background_color" VARCHAR(7) DEFAULT '#0f111a',
    "registration_fields" JSONB,
    "show_plans" BOOLEAN NOT NULL DEFAULT false,
    "show_lgpd" BOOLEAN NOT NULL DEFAULT true,
    "settings" TEXT,
    "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_template" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "thumbnail_url" VARCHAR(500),
    "html_template" TEXT NOT NULL,
    "css_template" TEXT,
    "type" VARCHAR(50) DEFAULT 'basico',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "cpf" VARCHAR(20),
    "mac" VARCHAR(50),
    "ip" VARCHAR(50),
    "status" "LeadStatus" NOT NULL DEFAULT 'novo',
    "source" VARCHAR(50) DEFAULT 'portal',
    "observations" TEXT,
    "lgpd_accepted" BOOLEAN NOT NULL DEFAULT false,
    "lgpd_accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "cpf" VARCHAR(14),
    "mac" VARCHAR(50) NOT NULL,
    "assigned_ip" VARCHAR(45) NOT NULL,
    "nas_ip" VARCHAR(45) NOT NULL,
    "connection_start_at" TIMESTAMP(3) NOT NULL,
    "connection_end_at" TIMESTAMP(3),
    "input_bytes" BIGINT NOT NULL DEFAULT 0,
    "output_bytes" BIGINT NOT NULL DEFAULT 0,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "disconnect_reason" VARCHAR(32),
    "auth_result" VARCHAR(32),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connection_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "portal_id" UUID,
    "phone" VARCHAR(20),
    "message" TEXT,
    "context_type" VARCHAR(50),
    "reference_id" UUID,
    "status" "WhatsappLogStatus" NOT NULL,
    "error_message" TEXT,
    "skip_reason" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "updates" (
    "id" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "changelog" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applied_updates" (
    "id" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applied_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_files" (
    "id" UUID NOT NULL,
    "update_id" VARCHAR(20),
    "file_path" VARCHAR(500),
    "file_content" TEXT,
    "action" "UpdateFileAction" DEFAULT 'update',

    CONSTRAINT "update_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_migrations" (
    "id" UUID NOT NULL,
    "update_id" VARCHAR(20),
    "sql_content" TEXT,
    "order" INTEGER DEFAULT 1,

    CONSTRAINT "update_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_apply_logs" (
    "id" UUID NOT NULL,
    "update_id" VARCHAR(20) NOT NULL,
    "step" VARCHAR(50) NOT NULL,
    "status" "UpdateApplyLogStatus" NOT NULL DEFAULT 'info',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "update_apply_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_snapshots" (
    "id" UUID NOT NULL,
    "file_path" VARCHAR(500),
    "md5_hash" VARCHAR(32),
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_snapshots" (
    "table_name" VARCHAR(128) NOT NULL,
    "columns_json" TEXT NOT NULL,
    "indexes_json" TEXT NOT NULL,
    "create_sql" TEXT,
    "snapshot_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schema_snapshots_pkey" PRIMARY KEY ("table_name")
);

-- CreateTable
CREATE TABLE "system_backups" (
    "id" UUID NOT NULL,
    "update_id" VARCHAR(20),
    "type" "SystemBackupType" DEFAULT 'manual',
    "db_dump_path" VARCHAR(500),
    "files_zip_path" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" UUID NOT NULL,
    "name" VARCHAR(75),
    "uf" VARCHAR(5),

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120),
    "state_id" UUID,
    "subdomain" VARCHAR(255),

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_slug_key" ON "accounts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_document_number_key" ON "accounts"("document_number");

-- CreateIndex
CREATE INDEX "accounts_status_idx" ON "accounts"("status");

-- CreateIndex
CREATE INDEX "accounts_deleted_at_idx" ON "accounts"("deleted_at");

-- CreateIndex
CREATE INDEX "organizations_account_id_idx" ON "organizations"("account_id");

-- CreateIndex
CREATE INDEX "organizations_status_idx" ON "organizations"("status");

-- CreateIndex
CREATE INDEX "organizations_deleted_at_idx" ON "organizations"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_account_id_slug_key" ON "organizations"("account_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_account_id_document_number_key" ON "organizations"("account_id", "document_number");

-- CreateIndex
CREATE INDEX "members_account_id_idx" ON "members"("account_id");

-- CreateIndex
CREATE INDEX "members_user_id_idx" ON "members"("user_id");

-- CreateIndex
CREATE INDEX "members_account_id_role_idx" ON "members"("account_id", "role");

-- CreateIndex
CREATE INDEX "members_account_id_status_idx" ON "members"("account_id", "status");

-- CreateIndex
CREATE INDEX "members_deleted_at_idx" ON "members"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "members_account_id_user_id_key" ON "members"("account_id", "user_id");

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE INDEX "addresses_state_id_idx" ON "addresses"("state_id");

-- CreateIndex
CREATE INDEX "addresses_city_id_idx" ON "addresses"("city_id");

-- CreateIndex
CREATE INDEX "addresses_deleted_at_idx" ON "addresses"("deleted_at");

-- CreateIndex
CREATE INDEX "tokens_user_id_idx" ON "tokens"("user_id");

-- CreateIndex
CREATE INDEX "tokens_user_id_expires_at_idx" ON "tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "tokens_deleted_at_idx" ON "tokens"("deleted_at");

-- CreateIndex
CREATE INDEX "otps_phone_idx" ON "otps"("phone");

-- CreateIndex
CREATE INDEX "otps_user_id_idx" ON "otps"("user_id");

-- CreateIndex
CREATE INDEX "otps_expires_at_idx" ON "otps"("expires_at");

-- CreateIndex
CREATE INDEX "otps_deleted_at_idx" ON "otps"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "config_mercadopago_organizationId_key" ON "config_mercadopago"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "efi_config_organizationId_key" ON "efi_config"("organizationId");

-- CreateIndex
CREATE INDEX "mikrotiks_organizationId_idx" ON "mikrotiks"("organizationId");

-- CreateIndex
CREATE INDEX "mikrotiks_host_idx" ON "mikrotiks"("host");

-- CreateIndex
CREATE INDEX "mikrotiks_deleted_at_idx" ON "mikrotiks"("deleted_at");

-- CreateIndex
CREATE INDEX "hotspot_plans_organizationId_idx" ON "hotspot_plans"("organizationId");

-- CreateIndex
CREATE INDEX "hotspot_users_organizationId_status_idx" ON "hotspot_users"("organizationId", "status");

-- CreateIndex
CREATE INDEX "hotspot_users_mac_address_idx" ON "hotspot_users"("mac_address");

-- CreateIndex
CREATE INDEX "hotspot_users_deleted_at_idx" ON "hotspot_users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "hotspot_users_organizationId_username_key" ON "hotspot_users"("organizationId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "vouchers_organization_id_status_idx" ON "vouchers"("organization_id", "status");

-- CreateIndex
CREATE INDEX "vouchers_expires_at_idx" ON "vouchers"("expires_at");

-- CreateIndex
CREATE INDEX "vouchers_deleted_at_idx" ON "vouchers"("deleted_at");

-- CreateIndex
CREATE INDEX "lgpd_consents_user_id_idx" ON "lgpd_consents"("user_id");

-- CreateIndex
CREATE INDEX "lgpd_consents_organization_id_idx" ON "lgpd_consents"("organization_id");

-- CreateIndex
CREATE INDEX "lgpd_consents_status_idx" ON "lgpd_consents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "lgpd_consents_user_id_organization_id_consent_version_key" ON "lgpd_consents"("user_id", "organization_id", "consent_version");

-- CreateIndex
CREATE INDEX "subscription_plans_organization_id_idx" ON "subscription_plans"("organization_id");

-- CreateIndex
CREATE INDEX "subscription_plans_status_idx" ON "subscription_plans"("status");

-- CreateIndex
CREATE INDEX "subscription_plans_is_public_idx" ON "subscription_plans"("is_public");

-- CreateIndex
CREATE INDEX "subscription_plans_is_default_idx" ON "subscription_plans"("is_default");

-- CreateIndex
CREATE INDEX "subscription_plans_deleted_at_idx" ON "subscription_plans"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_organization_id_code_key" ON "subscription_plans"("organization_id", "code");

-- CreateIndex
CREATE INDEX "subscriptions_organization_id_idx" ON "subscriptions"("organization_id");

-- CreateIndex
CREATE INDEX "subscriptions_subscription_plan_id_idx" ON "subscriptions"("subscription_plan_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions"("current_period_end");

-- CreateIndex
CREATE INDEX "subscriptions_deleted_at_idx" ON "subscriptions"("deleted_at");

-- CreateIndex
CREATE INDEX "payments_organization_id_idx" ON "payments"("organization_id");

-- CreateIndex
CREATE INDEX "payments_subscription_id_idx" ON "payments"("subscription_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_provider_transaction_id_idx" ON "payments"("provider_transaction_id");

-- CreateIndex
CREATE INDEX "payments_due_at_idx" ON "payments"("due_at");

-- CreateIndex
CREATE INDEX "payments_deleted_at_idx" ON "payments"("deleted_at");

-- CreateIndex
CREATE INDEX "campaigns_organization_id_idx" ON "campaigns"("organization_id");

-- CreateIndex
CREATE INDEX "campaign_items_campaign_id_order_idx" ON "campaign_items"("campaign_id", "order");

-- CreateIndex
CREATE INDEX "campaign_items_organization_id_idx" ON "campaign_items"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_configs_organization_id_config_type_key" ON "organization_configs"("organization_id", "config_type");

-- CreateIndex
CREATE INDEX "organization_vpn_peers_organization_id_idx" ON "organization_vpn_peers"("organization_id");

-- CreateIndex
CREATE INDEX "organization_vpn_peers_wg_client_id_idx" ON "organization_vpn_peers"("wg_client_id");

-- CreateIndex
CREATE INDEX "portals_organization_id_idx" ON "portals"("organization_id");

-- CreateIndex
CREATE INDEX "portals_active_campaign_id_idx" ON "portals"("active_campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "portals_organization_id_slug_key" ON "portals"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "leads_organization_id_idx" ON "leads"("organization_id");

-- CreateIndex
CREATE INDEX "connection_logs_organization_id_idx" ON "connection_logs"("organization_id");

-- CreateIndex
CREATE INDEX "connection_logs_cpf_idx" ON "connection_logs"("cpf");

-- CreateIndex
CREATE INDEX "connection_logs_mac_idx" ON "connection_logs"("mac");

-- CreateIndex
CREATE INDEX "connection_logs_assigned_ip_idx" ON "connection_logs"("assigned_ip");

-- CreateIndex
CREATE INDEX "connection_logs_connection_start_at_connection_end_at_idx" ON "connection_logs"("connection_start_at", "connection_end_at");

-- CreateIndex
CREATE INDEX "connection_logs_username_idx" ON "connection_logs"("username");

-- CreateIndex
CREATE INDEX "whatsapp_logs_organization_id_created_at_idx" ON "whatsapp_logs"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "whatsapp_logs_status_idx" ON "whatsapp_logs"("status");

-- CreateIndex
CREATE INDEX "whatsapp_logs_portal_id_idx" ON "whatsapp_logs"("portal_id");

-- CreateIndex
CREATE INDEX "update_files_update_id_idx" ON "update_files"("update_id");

-- CreateIndex
CREATE INDEX "update_migrations_update_id_idx" ON "update_migrations"("update_id");

-- CreateIndex
CREATE INDEX "update_apply_logs_update_id_idx" ON "update_apply_logs"("update_id");

-- CreateIndex
CREATE INDEX "update_apply_logs_created_at_idx" ON "update_apply_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "file_snapshots_file_path_key" ON "file_snapshots"("file_path");

-- CreateIndex
CREATE UNIQUE INDEX "states_uf_key" ON "states"("uf");

-- CreateIndex
CREATE INDEX "cities_state_id_idx" ON "cities"("state_id");

-- CreateIndex
CREATE INDEX "cities_subdomain_idx" ON "cities"("subdomain");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_mercadopago" ADD CONSTRAINT "config_mercadopago_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "efi_config" ADD CONSTRAINT "efi_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mikrotiks" ADD CONSTRAINT "mikrotiks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspot_plans" ADD CONSTRAINT "hotspot_plans_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspot_users" ADD CONSTRAINT "hotspot_users_mikrotikId_fkey" FOREIGN KEY ("mikrotikId") REFERENCES "mikrotiks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspot_users" ADD CONSTRAINT "hotspot_users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_mikrotik_id_fkey" FOREIGN KEY ("mikrotik_id") REFERENCES "mikrotiks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "hotspot_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lgpd_consents" ADD CONSTRAINT "lgpd_consents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lgpd_consents" ADD CONSTRAINT "lgpd_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_items" ADD CONSTRAINT "campaign_items_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_items" ADD CONSTRAINT "campaign_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_configs" ADD CONSTRAINT "organization_configs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_vpn_peers" ADD CONSTRAINT "organization_vpn_peers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portals" ADD CONSTRAINT "portals_active_campaign_id_fkey" FOREIGN KEY ("active_campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portals" ADD CONSTRAINT "portals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portals" ADD CONSTRAINT "portals_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "portal_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_logs" ADD CONSTRAINT "whatsapp_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_logs" ADD CONSTRAINT "whatsapp_logs_portal_id_fkey" FOREIGN KEY ("portal_id") REFERENCES "portals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_files" ADD CONSTRAINT "update_files_update_id_fkey" FOREIGN KEY ("update_id") REFERENCES "updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_migrations" ADD CONSTRAINT "update_migrations_update_id_fkey" FOREIGN KEY ("update_id") REFERENCES "updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
