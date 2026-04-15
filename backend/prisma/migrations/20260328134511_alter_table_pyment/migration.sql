/*
  Warnings:

  - You are about to drop the column `planId` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `planName` on the `payment` table. All the data in the column will be lost.
  - Added the required column `plan_id` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment" DROP COLUMN "planId",
DROP COLUMN "planName",
ADD COLUMN     "plan_id" UUID NOT NULL,
ADD COLUMN     "plan_name" VARCHAR(255);
