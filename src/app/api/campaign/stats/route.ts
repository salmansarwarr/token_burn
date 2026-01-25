import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Get promo code statistics
        const [available, allocated, total] = await Promise.all([
            prisma.promoCodes.count({
                where: { status: "AVAILABLE" },
            }),
            prisma.promoCodes.count({
                where: { status: "ALLOCATED" },
            }),
            prisma.promoCodes.count(),
        ]);

        const redeemed = await prisma.redemptions.count();

        // Calculate days left (if campaign end date is configured)
        const campaignEndDate = process.env.CAMPAIGN_END_DATE;
        let daysLeft = null;
        if (campaignEndDate) {
            const endDate = new Date(campaignEndDate);
            const now = new Date();
            const diffTime = endDate.getTime() - now.getTime();
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (daysLeft < 0) daysLeft = 0;
        }

        // Get burn amount from env
        const burnAmount =
            process.env.NEXT_PUBLIC_BURN_AMOUNT || "1000000000000000000";
        const burnAmountFormatted = (
            BigInt(burnAmount) / BigInt(10 ** 18)
        ).toString();

        return NextResponse.json({
            total,
            available,
            allocated,
            redeemed,
            burnAmount: burnAmountFormatted,
            daysLeft,
        });
    } catch (error: any) {
        console.error("Error fetching campaign stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 },
        );
    }
}
