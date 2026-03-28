-- CreateEnum
CREATE TYPE "environment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateTable
CREATE TABLE "admin" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_mercadopago" (
    "id" UUID NOT NULL,
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
    "id" UUID NOT NULL,
    "client_id" VARCHAR(255) NOT NULL,
    "client_secret" VARCHAR(255) NOT NULL,
    "pix_key" VARCHAR(255) NOT NULL,
    "environment" "environment" NOT NULL DEFAULT 'SANDBOX',
    "certificate_name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "efi_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_login" (
    "id" UUID NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "mac_address" VARCHAR(50),
    "ip_address" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lgpd_login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mikrotik_router" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 8728,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Offline',
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hotspot_url" VARCHAR(255),

    CONSTRAINT "mikrotik_router_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL,
    "planId" INTEGER NOT NULL,
    "email" VARCHAR(255),
    "planName" VARCHAR(255),
    "amount_cents" INTEGER NOT NULL,
    "status" VARCHAR(50),
    "mercado_pago_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mac_address" VARCHAR(20),
    "cpf" VARCHAR(20),
    "ip_address" VARCHAR(45),

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration_mins" INTEGER NOT NULL,
    "download_speed" VARCHAR(20) NOT NULL,
    "upload_speed" VARCHAR(20) NOT NULL,
    "mikrotik_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "address_pool" VARCHAR(50) NOT NULL DEFAULT 'default-dhcp',
    "shared_users" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "name" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_otp" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radius_users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "plano_id" INTEGER,
    "nas_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radius_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radcheck" (
    "id" UUID NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "attribute" VARCHAR(64) NOT NULL DEFAULT 'Cleartext-Password',
    "op" CHAR(2) NOT NULL DEFAULT ':=',
    "value" VARCHAR(253) NOT NULL,

    CONSTRAINT "radcheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radreply" (
    "id" UUID NOT NULL,
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
CREATE TABLE "otp_request" (
    "id" UUID NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_audit_logs" (
    "id" UUID NOT NULL,
    "event" VARCHAR(50) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "phone_number" VARCHAR(20),
    "ip_address" VARCHAR(45),
    "detail" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PaymentToPlan" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PaymentToPlan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_cpf_key" ON "user"("cpf");

-- CreateIndex
CREATE INDEX "user_cpf_idx" ON "user"("cpf");

-- CreateIndex
CREATE INDEX "user_phone_number_idx" ON "user"("phone_number");

-- CreateIndex
CREATE INDEX "user_otp_user_id_idx" ON "user_otp"("user_id");

-- CreateIndex
CREATE INDEX "user_otp_expires_at_idx" ON "user_otp"("expires_at");

-- CreateIndex
CREATE INDEX "user_otp_user_id_created_at_idx" ON "user_otp"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "otp_audit_logs_cpf_idx" ON "otp_audit_logs"("cpf");

-- CreateIndex
CREATE INDEX "otp_audit_logs_event_idx" ON "otp_audit_logs"("event");

-- CreateIndex
CREATE INDEX "otp_audit_logs_created_at_idx" ON "otp_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "_PaymentToPlan_B_index" ON "_PaymentToPlan"("B");

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_mikrotik_id_fkey" FOREIGN KEY ("mikrotik_id") REFERENCES "mikrotik_router"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_otp" ADD CONSTRAINT "user_otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentToPlan" ADD CONSTRAINT "_PaymentToPlan_A_fkey" FOREIGN KEY ("A") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentToPlan" ADD CONSTRAINT "_PaymentToPlan_B_fkey" FOREIGN KEY ("B") REFERENCES "plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
