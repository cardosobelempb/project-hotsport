/*
  Warnings:

  - The values [ACTIVE] on the enum `VoucherStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `provider_type` on the `accounts` table. All the data in the column will be lost.
  - The `provider` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `customerId` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `isPrimary` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `lgpd_consents` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `lgpd_consents` table. All the data in the column will be lost.
  - The `status` column on the `lgpd_consents` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `expires_at` on the `memberships` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `memberships` table. All the data in the column will be lost.
  - The `role` column on the `memberships` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `memberships` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `contact_email` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `document_number` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `document_type` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `document_type` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `verification_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the `_LeadToOrganization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LeadToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,consent_version]` on the table `lgpd_consents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,tenant_id,organization_id]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.
  - Made the column `token_type` on table `accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mac_address` on table `mikrotiks` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ip_address` on table `mikrotiks` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenant_id` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expired_at` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expired_at` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expired_at` to the `tokens` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password_hash` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `expired_at` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `verification_tokens` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "UserProfileStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "MemberShipRole" AS ENUM ('OWNER', 'ADMIN', 'AFFILIATE', 'OPERATOR', 'CUSTOMER', 'MANAGER', 'SUPPORT', 'FINANCE', 'MEMBER');

-- CreateEnum
CREATE TYPE "MemberShipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED', 'DELETED');

-- CreateEnum
CREATE TYPE "LgpdConsentStatus" AS ENUM ('ACTIVE', 'REVOKED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'AFFILIATE', 'OPERATOR', 'CUSTOMER', 'MANAGER', 'SUPPORT', 'FINANCE', 'MEMBER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED', 'DELETED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "LeadStatus" ADD VALUE 'INACTIVE';
ALTER TYPE "LeadStatus" ADD VALUE 'BANNED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'APPROVED';
ALTER TYPE "PaymentStatus" ADD VALUE 'REJECTED';

-- AlterEnum
BEGIN;
CREATE TYPE "VoucherStatus_new" AS ENUM ('USED', 'UNUSED', 'EXPIRED', 'REVOKED', 'CANCELED');
ALTER TABLE "public"."vouchers" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "vouchers" ALTER COLUMN "status" TYPE "VoucherStatus_new" USING ("status"::text::"VoucherStatus_new");
ALTER TYPE "VoucherStatus" RENAME TO "VoucherStatus_old";
ALTER TYPE "VoucherStatus_new" RENAME TO "VoucherStatus";
DROP TYPE "public"."VoucherStatus_old";
ALTER TABLE "vouchers" ALTER COLUMN "status" SET DEFAULT 'UNUSED';
COMMIT;

-- DropForeignKey
ALTER TABLE "_LeadToOrganization" DROP CONSTRAINT "_LeadToOrganization_A_fkey";

-- DropForeignKey
ALTER TABLE "_LeadToOrganization" DROP CONSTRAINT "_LeadToOrganization_B_fkey";

-- DropForeignKey
ALTER TABLE "_LeadToUser" DROP CONSTRAINT "_LeadToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_LeadToUser" DROP CONSTRAINT "_LeadToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "lgpd_consents" DROP CONSTRAINT "lgpd_consents_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "lgpd_consents" DROP CONSTRAINT "lgpd_consents_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "vouchers" DROP CONSTRAINT "vouchers_plan_id_fkey";

-- DropIndex
DROP INDEX "lgpd_consents_tenant_id_idx";

-- DropIndex
DROP INDEX "lgpd_consents_user_id_tenant_id_consent_version_key";

-- DropIndex
DROP INDEX "memberships_invited_email_idx";

-- DropIndex
DROP INDEX "memberships_user_id_tenant_id_key";

-- DropIndex
DROP INDEX "organizations_document_number_key";

-- DropIndex
DROP INDEX "organizations_slug_key";

-- DropIndex
DROP INDEX "otps_expires_at_idx";

-- DropIndex
DROP INDEX "tokens_user_id_expires_at_idx";

-- DropIndex
DROP INDEX "users_status_idx";

-- DropIndex
DROP INDEX "vouchers_expires_at_idx";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "provider_type",
DROP COLUMN "provider",
ADD COLUMN     "provider" "ProviderType" NOT NULL DEFAULT 'CREDENTIALS',
ALTER COLUMN "token_type" SET NOT NULL;

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "customerId",
DROP COLUMN "isPrimary",
DROP COLUMN "type",
ADD COLUMN     "address_type" "AddressType" DEFAULT 'HOME',
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_primary" BOOLEAN DEFAULT false,
ADD COLUMN     "member_id" UUID,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "campaigns" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "config_mercadopago" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "efi_configs" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "hotspot_plans" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "hotspot_users" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" UUID,
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lgpd_consents" DROP COLUMN "organizationId",
DROP COLUMN "tenant_id",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "LgpdConsentStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "expires_at",
DROP COLUMN "organizationId",
ADD COLUMN     "expired_at" TIMESTAMP(3),
ADD COLUMN     "organization_id" UUID,
DROP COLUMN "role",
ADD COLUMN     "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
DROP COLUMN "status",
ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "mikrotiks" ALTER COLUMN "mac_address" SET NOT NULL,
ALTER COLUMN "ip_address" SET NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization_configs" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "contact_email",
DROP COLUMN "document_number",
DROP COLUMN "document_type",
DROP COLUMN "phone",
DROP COLUMN "tenantId",
ADD COLUMN     "tenant_id" UUID NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "expires_at",
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "portals" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "schema_snapshots" ALTER COLUMN "snapshot_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "expires",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ip_address" VARCHAR(45),
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "user_agent" VARCHAR(500);

-- AlterTable
ALTER TABLE "states" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subscription_plans" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "expires_at",
ADD COLUMN     "expired_at" TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "document_type",
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "expires_at",
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ip_address" VARCHAR(45),
ADD COLUMN     "user_agent" VARCHAR(500),
ALTER COLUMN "type" SET DEFAULT 'REFRESH',
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "full_name" VARCHAR(200),
ADD COLUMN     "status" "UserProfileStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "status",
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password_hash" SET NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "verification_tokens" DROP COLUMN "expires",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "used_at" TIMESTAMP(3),
ADD CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "expires_at",
ADD COLUMN     "expired_at" TIMESTAMP(3),
ALTER COLUMN "organization_id" DROP NOT NULL,
ALTER COLUMN "plan_id" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- DropTable
DROP TABLE "_LeadToOrganization";

-- DropTable
DROP TABLE "_LeadToUser";

-- DropEnum
DROP TYPE "ConsentStatus";

-- DropEnum
DROP TYPE "MemberRole";

-- DropEnum
DROP TYPE "MemberStatus";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateIndex
CREATE INDEX "accounts_expires_at_idx" ON "accounts"("expires_at");

-- CreateIndex
CREATE INDEX "accounts_deleted_at_idx" ON "accounts"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE INDEX "cities_deleted_at_idx" ON "cities"("deleted_at");

-- CreateIndex
CREATE INDEX "hotspot_plans_deleted_at_idx" ON "hotspot_plans"("deleted_at");

-- CreateIndex
CREATE INDEX "lgpd_consents_status_idx" ON "lgpd_consents"("status");

-- CreateIndex
CREATE INDEX "lgpd_consents_deleted_at_idx" ON "lgpd_consents"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "lgpd_consents_user_id_consent_version_key" ON "lgpd_consents"("user_id", "consent_version");

-- CreateIndex
CREATE INDEX "memberships_organization_id_idx" ON "memberships"("organization_id");

-- CreateIndex
CREATE INDEX "memberships_tenant_id_role_idx" ON "memberships"("tenant_id", "role");

-- CreateIndex
CREATE INDEX "memberships_tenant_id_status_idx" ON "memberships"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_tenant_id_organization_id_key" ON "memberships"("user_id", "tenant_id", "organization_id");

-- CreateIndex
CREATE INDEX "otps_expired_at_idx" ON "otps"("expired_at");

-- CreateIndex
CREATE INDEX "sessions_expired_at_idx" ON "sessions"("expired_at");

-- CreateIndex
CREATE INDEX "sessions_deleted_at_idx" ON "sessions"("deleted_at");

-- CreateIndex
CREATE INDEX "states_deleted_at_idx" ON "states"("deleted_at");

-- CreateIndex
CREATE INDEX "tokens_expired_at_idx" ON "tokens"("expired_at");

-- CreateIndex
CREATE INDEX "tokens_revoked_at_idx" ON "tokens"("revoked_at");

-- CreateIndex
CREATE INDEX "user_profiles_deleted_at_idx" ON "user_profiles"("deleted_at");

-- CreateIndex
CREATE INDEX "verification_tokens_identifier_idx" ON "verification_tokens"("identifier");

-- CreateIndex
CREATE INDEX "verification_tokens_expired_at_idx" ON "verification_tokens"("expired_at");

-- CreateIndex
CREATE INDEX "vouchers_expired_at_idx" ON "vouchers"("expired_at");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "hotspot_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
