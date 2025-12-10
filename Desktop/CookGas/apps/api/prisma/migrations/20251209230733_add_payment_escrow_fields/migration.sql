-- CreateEnum
CREATE TYPE "EscrowState" AS ENUM ('PENDING', 'HELD', 'RELEASED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "escrowState" "EscrowState" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "payoutId" TEXT;

-- CreateIndex
CREATE INDEX "Payment_payoutId_idx" ON "Payment"("payoutId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
