/*
  Warnings:

  - Added the required column `access_token` to the `token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "token" ADD COLUMN     "access_token" VARCHAR(255) NOT NULL;
