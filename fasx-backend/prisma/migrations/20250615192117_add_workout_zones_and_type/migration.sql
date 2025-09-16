/*
  Warnings:

  - Added the required column `date` to the `Workout` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Workout` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('Running', 'CrossCountrySkiingSkate', 'ClassicCrossCountrySkiing', 'SkateRollerSkis', 'ClassicRollerSki', 'StrengthTraining', 'Swimming', 'Entertainment', 'Bike');

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zone1Min" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zone2Min" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zone3Min" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zone4Min" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zone5Min" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "type",
ADD COLUMN     "type" "WorkoutType" NOT NULL;
