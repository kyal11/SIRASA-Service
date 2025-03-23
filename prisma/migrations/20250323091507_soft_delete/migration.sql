-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3);
