/*
  Warnings:

  - You are about to drop the `booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `slot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_roomId_fkey";

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "bookingSlot" DROP CONSTRAINT "bookingSlot_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "bookingSlot" DROP CONSTRAINT "bookingSlot_slotId_fkey";

-- DropForeignKey
ALTER TABLE "slot" DROP CONSTRAINT "slot_roomId_fkey";

-- DropTable
DROP TABLE "booking";

-- DropTable
DROP TABLE "room";

-- DropTable
DROP TABLE "slot";

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "floor" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookingIdSlot" TEXT,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "slots_bookingIdSlot_key" ON "slots"("bookingIdSlot");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingSlot" ADD CONSTRAINT "bookingSlot_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingSlot" ADD CONSTRAINT "bookingSlot_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
