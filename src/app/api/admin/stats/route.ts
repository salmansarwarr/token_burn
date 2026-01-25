import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();

        // Check admin authentication
        if (!session.adminId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Get promo code statistics
        const [available, allocated, expired, total] = await Promise.all([
            prisma.promoCodes.count({
                where: { status: "AVAILABLE" },
            }),
            prisma.promoCodes.count({
                where: { status: "ALLOCATED" },
            }),
            prisma.promoCodes.count({
                where: { status: "EXPIRED" },
            }),
            prisma.promoCodes.count(),
        ]);

        const redeemed = await prisma.redemptions.count();

        // Get campaign dates from env
        const campaignStartDate = process.env.CAMPAIGN_START_DATE;
        const campaignEndDate = process.env.CAMPAIGN_END_DATE;

        let daysLeft = null;
        if (campaignEndDate) {
            const endDate = new Date(campaignEndDate);
            const now = new Date();
            const diffTime = endDate.getTime() - now.getTime();
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (daysLeft < 0) daysLeft = 0;
        }

        return NextResponse.json({
            total,
            available,
            allocated,
            expired,
            redeemed,
            campaignStart: campaignStartDate,
            campaignEnd: campaignEndDate,
            daysLeft,
        });
    } catch (error: any) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 },
        );
    }
}
