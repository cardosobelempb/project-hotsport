/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `credentials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lgpd_logins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mikrotiks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otp_audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otp_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `radius_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "credentials" DROP CONSTRAINT "credentials_user_id_fkey";

-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_mikrotik_id_fkey";

-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_otps" DROP CONSTRAINT "user_otps_user_id_fkey";

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "credentials";

-- DropTable
DROP TABLE "lgpd_logins";

-- DropTable
DROP TABLE "mikrotiks";

-- DropTable
DROP TABLE "otp_audit_logs";

-- DropTable
DROP TABLE "otp_requests";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "plans";

-- DropTable
DROP TABLE "radius_users";

-- DropTable
DROP TABLE "tokens";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_login" (
    "id" SERIAL NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "mac" VARCHAR(50),
    "ip" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(100),
    "phone" VARCHAR(20),

    CONSTRAINT "lgpd_login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mikrotik" (
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

    CONSTRAINT "mikrotik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
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

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan" (
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

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "cpf" VARCHAR(14) NOT NULL,
    "phone_number" VARCHAR(20),
    "status" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radius_user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "plan_id" INTEGER,
    "nas_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radius_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_request" (
    "id" SERIAL NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_audit_log" (
    "id" SERIAL NOT NULL,
    "event" VARCHAR(50) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "phone" VARCHAR(20),
    "ip" VARCHAR(45),
    "detail" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lgpd_login_cpf_key" ON "lgpd_login"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "user_cpf_key" ON "user"("cpf");

-- CreateIndex
CREATE INDEX "user_cpf_idx" ON "user"("cpf");

-- CreateIndex
CREATE INDEX "user_phone_number_idx" ON "user"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "auth_email_key" ON "auth"("email");

-- CreateIndex
CREATE INDEX "auth_user_id_idx" ON "auth"("user_id");

-- CreateIndex
CREATE INDEX "token_user_id_idx" ON "token"("user_id");

-- CreateIndex
CREATE INDEX "token_expires_at_idx" ON "token"("expires_at");

-- CreateIndex
CREATE INDEX "otp_audit_log_cpf_idx" ON "otp_audit_log"("cpf");

-- CreateIndex
CREATE INDEX "otp_audit_log_event_idx" ON "otp_audit_log"("event");

-- CreateIndex
CREATE INDEX "otp_audit_log_created_at_idx" ON "otp_audit_log"("created_at");

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_mikrotik_id_fkey" FOREIGN KEY ("mikrotik_id") REFERENCES "mikrotik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth" ADD CONSTRAINT "auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_otps" ADD CONSTRAINT "user_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
