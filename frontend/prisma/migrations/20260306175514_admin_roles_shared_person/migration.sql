-- DropForeignKey
ALTER TABLE "person" DROP CONSTRAINT "person_userId_fkey";

-- DropIndex
DROP INDEX "person_userId_idx";

-- AlterTable
ALTER TABLE "person" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
