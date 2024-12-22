/*
  Warnings:

  - You are about to drop the column `availableActionId` on the `Action` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_availableActionId_fkey";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "availableActionId";

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "AvailableAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
