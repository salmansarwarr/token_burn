-- AlterTable
ALTER TABLE "promo_codes" ADD COLUMN     "campaign" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_uses" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "used_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "promo_codes_campaign_idx" ON "promo_codes"("campaign");

-- CreateIndex
CREATE INDEX "promo_codes_is_active_idx" ON "promo_codes"("is_active");
