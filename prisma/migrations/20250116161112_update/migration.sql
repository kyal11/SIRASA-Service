/*
  Warnings:

  - You are about to drop the column `imagUrl` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "imagUrl",
ADD COLUMN     "imageUrl" TEXT;
