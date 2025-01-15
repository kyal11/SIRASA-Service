/*
  Warnings:

  - You are about to drop the column `created_at` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "room" DROP COLUMN "created_at",
DROP COLUMN "end_time",
DROP COLUMN "start_time",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "slot" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "image_url",
DROP COLUMN "phone_number",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imagUrl" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookingSlot" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,

    CONSTRAINT "bookingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookingSlot_bookingId_slotId_key" ON "bookingSlot"("bookingId", "slotId");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingSlot" ADD CONSTRAINT "bookingSlot_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookingSlot" ADD CONSTRAINT "bookingSlot_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
