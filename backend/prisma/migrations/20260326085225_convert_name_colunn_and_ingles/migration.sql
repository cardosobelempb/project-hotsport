-- CreateEnum
CREATE TYPE "Ambiente" AS ENUM ('SANDBOX', 'PRODUCTION');

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
    "chave_pix" VARCHAR(255) NOT NULL,
    "ambiente" "Ambiente" NOT NULL DEFAULT 'SANDBOX',
    "certificado_nome" VARCHAR(255),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "efi_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_logins" (
    "id" SERIAL NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "aceite" BOOLEAN NOT NULL DEFAULT false,
    "mac" VARCHAR(50),
    "ip" VARCHAR(50),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" VARCHAR(100),
    "telefone" VARCHAR(20),

    CONSTRAINT "lgpd_logins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mikrotiks" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "usuario" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "porta" INTEGER NOT NULL DEFAULT 8728,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Offline',
    "usuarios_ativos" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_hotspot" VARCHAR(255),

    CONSTRAINT "mikrotiks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" SERIAL NOT NULL,
    "plano_id" INTEGER NOT NULL,
    "email" VARCHAR(255),
    "nome_plano" VARCHAR(255),
    "valor" INTEGER NOT NULL,
    "status" VARCHAR(50),
    "mp_pagamento_id" BIGINT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMP(3),
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mac" VARCHAR(20),
    "cpf" VARCHAR(20),
    "IP" VARCHAR(20),

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "duracao_minutos" INTEGER NOT NULL,
    "velocidade_down" VARCHAR(20) NOT NULL,
    "velocidade_up" VARCHAR(20) NOT NULL,
    "mikrotik_id" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "address_pool" VARCHAR(50) NOT NULL DEFAULT 'default-dhcp',
    "shared_users" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "name" VARCHAR(100),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_otps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radius_users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "plano_id" INTEGER,
    "nas_id" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "telefone" VARCHAR(20) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_audit_logs" (
    "id" SERIAL NOT NULL,
    "event" VARCHAR(50) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "telefone" VARCHAR(20),
    "ip" VARCHAR(45),
    "detail" VARCHAR(500),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_cpf_idx" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "user_otps_user_id_idx" ON "user_otps"("user_id");

-- CreateIndex
CREATE INDEX "user_otps_expires_at_idx" ON "user_otps"("expires_at");

-- CreateIndex
CREATE INDEX "user_otps_user_id_created_at_idx" ON "user_otps"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "otp_audit_logs_cpf_idx" ON "otp_audit_logs"("cpf");

-- CreateIndex
CREATE INDEX "otp_audit_logs_event_idx" ON "otp_audit_logs"("event");

-- CreateIndex
CREATE INDEX "otp_audit_logs_criado_em_idx" ON "otp_audit_logs"("criado_em");

-- AddForeignKey
ALTER TABLE "planos" ADD CONSTRAINT "planos_mikrotik_id_fkey" FOREIGN KEY ("mikrotik_id") REFERENCES "mikrotiks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_otps" ADD CONSTRAINT "user_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
