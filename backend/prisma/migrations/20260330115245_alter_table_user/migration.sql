/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "first_name" VARCHAR(100),
ADD COLUMN     "last_name" VARCHAR(100),
ADD COLUMN     "password" VARCHAR(255),
ADD COLUMN     "phone_number" VARCHAR(20),
ADD COLUMN     "status" VARCHAR(50);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_mercadopago" (
    "id" SERIAL NOT NULL,
    "public_key" VARCHAR(255),
    "access_token" TEXT,
    "client_id" VARCHAR(255),
    "client_secret" TEXT,
    "webhook_secret" VARCHAR(255),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "config_mercadopago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "efi_config" (
    "id" SERIAL NOT NULL,
    "client_id" VARCHAR(255) NOT NULL,
    "client_secret" VARCHAR(255) NOT NULL,
    "pix_key" VARCHAR(255) NOT NULL,
    "environment" "Environment" NOT NULL DEFAULT 'SANDBOX',
    "certificate_name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "efi_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_logins" (
    "id" SERIAL NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "mac" VARCHAR(50),
    "ip" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(100),
    "phone" VARCHAR(20),

    CONSTRAINT "lgpd_logins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mikrotiks" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 8728,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Offline',
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hotspot_address" VARCHAR(255),

    CONSTRAINT "mikrotiks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "email" VARCHAR(255),
    "plan_name" VARCHAR(255),
    "amount" INTEGER NOT NULL,
    "status" VARCHAR(50),
    "mp_payment_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mac" VARCHAR(20),
    "cpf" VARCHAR(20),
    "ip" VARCHAR(20),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "download_speed" VARCHAR(20) NOT NULL,
    "upload_speed" VARCHAR(20) NOT NULL,
    "mikrotik_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "address_pool" VARCHAR(50) NOT NULL DEFAULT 'default-dhcp',
    "shared_users" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radius_users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "plan_id" INTEGER,
    "nas_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radius_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radcheck" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "attribute" VARCHAR(64) NOT NULL DEFAULT 'Cleartext-Password',
    "op" CHAR(2) NOT NULL DEFAULT ':=',
    "value" VARCHAR(253) NOT NULL,

    CONSTRAINT "radcheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radreply" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "attribute" VARCHAR(64) NOT NULL,
    "op" CHAR(2) NOT NULL DEFAULT ':=',
    "value" VARCHAR(253) NOT NULL,

    CONSTRAINT "radreply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radusergroup" (
    "username" VARCHAR(64) NOT NULL,
    "groupname" VARCHAR(64) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "radusergroup_pkey" PRIMARY KEY ("username","groupname")
);

-- CreateTable
CREATE TABLE "otp_requests" (
    "id" SERIAL NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_audit_logs" (
    "id" SERIAL NOT NULL,
    "event" VARCHAR(50) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "phone" VARCHAR(20),
    "ip" VARCHAR(45),
    "detail" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lgpd_logins_cpf_key" ON "lgpd_logins"("cpf");

-- CreateIndex
CREATE INDEX "otp_audit_logs_cpf_idx" ON "otp_audit_logs"("cpf");

-- CreateIndex
CREATE INDEX "otp_audit_logs_event_idx" ON "otp_audit_logs"("event");

-- CreateIndex
CREATE INDEX "otp_audit_logs_created_at_idx" ON "otp_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "user_otps_user_id_created_at_idx" ON "user_otps"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_mikrotik_id_fkey" FOREIGN KEY ("mikrotik_id") REFERENCES "mikrotiks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
