/*
  Warnings:

  - You are about to drop the column `userId` on the `interviews` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_userId_fkey";

-- AlterTable
ALTER TABLE "interviews" DROP COLUMN "userId";
