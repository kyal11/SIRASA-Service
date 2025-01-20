-- CreateEnum
CREATE TYPE "statusBooking" AS ENUM ('cancel', 'booked', 'success');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "status" "statusBooking" NOT NULL DEFAULT 'booked';
