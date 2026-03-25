-- ============================================================================
-- Migration: Refactor Portuguese model/field names to English
-- Renames tables, columns, and enum types from Portuguese to English.
-- Safe to run on a clean DB (tables may not yet exist) or existing dev DB.
-- ============================================================================

-- ── admins table ─────────────────────────────────────────────────────────────
-- No column renames needed (created_at already English)

-- ── config_mercadopago table ─────────────────────────────────────────────────
-- No column renames needed (all fields already English snake_case)

-- ── efi_config: rename columns and enum ──────────────────────────────────────

DO $$ BEGIN
  -- Rename table columns if they exist with old Portuguese names
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'efi_config' AND column_name = 'chave_pix'
  ) THEN
    ALTER TABLE "efi_config" RENAME COLUMN "chave_pix" TO "pix_key";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'efi_config' AND column_name = 'certificado_nome'
  ) THEN
    ALTER TABLE "efi_config" RENAME COLUMN "certificado_nome" TO "certificate_name";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'efi_config' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE "efi_config" RENAME COLUMN "criado_em" TO "created_at";
  END IF;
END $$;

-- Rename enum Ambiente → Environment and its values
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Ambiente') THEN
    ALTER TYPE "Ambiente" RENAME TO "Environment";
    ALTER TYPE "Environment" RENAME VALUE 'sandbox' TO 'SANDBOX';
    ALTER TYPE "Environment" RENAME VALUE 'producao' TO 'PRODUCTION';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'efi_config' AND column_name = 'ambiente'
  ) THEN
    ALTER TABLE "efi_config" RENAME COLUMN "ambiente" TO "environment";
  END IF;
END $$;

-- ── lgpd_logins: rename Portuguese columns ───────────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lgpd_logins' AND column_name = 'aceite'
  ) THEN
    ALTER TABLE "lgpd_logins" RENAME COLUMN "aceite" TO "consent";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lgpd_logins' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE "lgpd_logins" RENAME COLUMN "criado_em" TO "created_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lgpd_logins' AND column_name = 'nome'
  ) THEN
    ALTER TABLE "lgpd_logins" RENAME COLUMN "nome" TO "name";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lgpd_logins' AND column_name = 'telefone'
  ) THEN
    ALTER TABLE "lgpd_logins" RENAME COLUMN "telefone" TO "phone";
  END IF;
END $$;

-- ── mikrotiks: rename Portuguese columns ─────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mikrotiks' AND column_name = 'nome'
  ) THEN
    ALTER TABLE "mikrotiks" RENAME COLUMN "nome" TO "name";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mikrotiks' AND column_name = 'usuario'
  ) THEN
    ALTER TABLE "mikrotiks" RENAME COLUMN "usuario" TO "username";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mikrotiks' AND column_name = 'senha'
  ) THEN
    ALTER TABLE "mikrotiks" RENAME COLUMN "senha" TO "password";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mikrotiks' AND column_name = 'porta'
  ) THEN
    ALTER TABLE "mikrotiks" RENAME COLUMN "porta" TO "port";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mikrotiks' AND column_name = 'usuarios_ativos'
  ) THEN
    ALTER TABLE "mikrotiks" RENAME COLUMN "usuarios_ativos" TO "active_users";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mikrotiks' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE "mikrotiks" RENAME COLUMN "criado_em" TO "created_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mikrotiks' AND column_name = 'end_hotspot'
  ) THEN
    ALTER TABLE "mikrotiks" RENAME COLUMN "end_hotspot" TO "hotspot_address";
  END IF;
END $$;

-- ── planos → plans: rename table and columns ─────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planos') THEN
    ALTER TABLE "planos" RENAME TO "plans";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'nome'
  ) THEN
    ALTER TABLE "plans" RENAME COLUMN "nome" TO "name";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE "plans" RENAME COLUMN "descricao" TO "description";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'valor'
  ) THEN
    ALTER TABLE "plans" RENAME COLUMN "valor" TO "amount";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'duracao_minutos'
  ) THEN
    ALTER TABLE "plans" RENAME COLUMN "duracao_minutos" TO "duration_minutes";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'velocidade_down'
  ) THEN
    ALTER TABLE "plans" RENAME COLUMN "velocidade_down" TO "download_speed";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'velocidade_up'
  ) THEN
    ALTER TABLE "plans" RENAME COLUMN "velocidade_up" TO "upload_speed";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plans' AND column_name = 'ativo'
  ) THEN
    ALTER TABLE "plans" RENAME COLUMN "ativo" TO "active";
  END IF;
END $$;

-- ── pagamentos → payments: rename table and columns ──────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagamentos') THEN
    ALTER TABLE "pagamentos" RENAME TO "payments";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'plano_id'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "plano_id" TO "plan_id";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'nome_plano'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "nome_plano" TO "plan_name";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'valor'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "valor" TO "amount";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'mp_pagamento_id'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "mp_pagamento_id" TO "mp_payment_id";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "criado_em" TO "created_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'expira_em'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "expira_em" TO "expires_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'atualizado_em'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "atualizado_em" TO "updated_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'IP'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "IP" TO "ip";
  END IF;
END $$;

-- ── otp_requests: rename Portuguese columns ──────────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_requests' AND column_name = 'telefone'
  ) THEN
    ALTER TABLE "otp_requests" RENAME COLUMN "telefone" TO "phone";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_requests' AND column_name = 'otp_hash'
  ) THEN
    -- otp_hash is already fine (English), just kept for completeness
    NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_requests' AND column_name = 'max_attempts'
  ) THEN
    -- max_attempts already English, no rename needed
    NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_requests' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE "otp_requests" RENAME COLUMN "criado_em" TO "created_at";
  END IF;
END $$;

-- ── otp_audit_logs: rename Portuguese columns ────────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_audit_logs' AND column_name = 'telefone'
  ) THEN
    ALTER TABLE "otp_audit_logs" RENAME COLUMN "telefone" TO "phone";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_audit_logs' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE "otp_audit_logs" RENAME COLUMN "criado_em" TO "created_at";
  END IF;
END $$;

-- ── radius_users: rename Portuguese columns ──────────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'radius_users' AND column_name = 'plano_id'
  ) THEN
    ALTER TABLE "radius_users" RENAME COLUMN "plano_id" TO "plan_id";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'radius_users' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE "radius_users" RENAME COLUMN "criado_em" TO "created_at";
  END IF;
END $$;
