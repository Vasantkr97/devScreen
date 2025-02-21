/*
  Warnings:

  - Added the required column `userId` to the `interviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_candidateId_fkey";

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
