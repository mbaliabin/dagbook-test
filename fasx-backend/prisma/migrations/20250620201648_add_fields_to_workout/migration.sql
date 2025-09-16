/*
  Warnings:

  - The values [CrossCountrySkiingSkate,ClassicCrossCountrySkiing,SkateRollerSkis,ClassicRollerSki,Swimming,Entertainment] on the enum `WorkoutType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorkoutType_new" AS ENUM ('Running', 'XC_Skiing_Classic', 'XC_Skiing_Skate', 'RollerSki_Classic', 'StrengthTraining', 'Other', 'Bike');
ALTER TABLE "Workout" ALTER COLUMN "type" TYPE "WorkoutType_new" USING ("type"::text::"WorkoutType_new");
ALTER TYPE "WorkoutType" RENAME TO "WorkoutType_old";
ALTER TYPE "WorkoutType_new" RENAME TO "WorkoutType";
DROP TYPE "WorkoutType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "effort" INTEGER,
ADD COLUMN     "feeling" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
