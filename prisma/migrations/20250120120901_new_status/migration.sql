/*
  Warnings:

  - The values [success] on the enum `statusBooking` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "statusBooking_new" AS ENUM ('cancel', 'booked', 'done');
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "statusBooking_new" USING ("status"::text::"statusBooking_new");
ALTER TYPE "statusBooking" RENAME TO "statusBooking_old";
ALTER TYPE "statusBooking_new" RENAME TO "statusBooking";
DROP TYPE "statusBooking_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'booked';
COMMIT;
