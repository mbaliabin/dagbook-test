/*
  Warnings:

  - You are about to drop the column `calories` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `distanceKm` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `durationMin` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Workout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Follow_followerId_followingId_key";

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "calories",
DROP COLUMN "date",
DROP COLUMN "description",
DROP COLUMN "distanceKm",
DROP COLUMN "durationMin",
DROP COLUMN "title",
ADD COLUMN     "distance" DOUBLE PRECISION,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
