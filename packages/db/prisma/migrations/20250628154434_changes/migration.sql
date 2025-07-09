/*
  Warnings:

  - You are about to drop the column `avtar` on the `User` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avtar",
ADD COLUMN     "photo" TEXT,
ALTER COLUMN "name" SET NOT NULL;
