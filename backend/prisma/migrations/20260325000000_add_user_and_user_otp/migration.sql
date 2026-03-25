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

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "users_cpf_idx" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "user_otps_user_id_idx" ON "user_otps"("user_id");

-- CreateIndex
CREATE INDEX "user_otps_expires_at_idx" ON "user_otps"("expires_at");

-- AddForeignKey
ALTER TABLE "user_otps" ADD CONSTRAINT "user_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
