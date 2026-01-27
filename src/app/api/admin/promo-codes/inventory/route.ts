import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CodeStatus } from "@prisma/client";

export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (!session.adminId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const campaign = searchParams.get("campaign");
        const batchId = searchParams.get("batchId");

        // Build filter
        const where: any = {};
        if (campaign) where.campaign = campaign;
        if (batchId) where.batchId = batchId;

        const [
            available,
            allocated,
            redeemed,
            expired,
            total,
            active,
            inactive,
            singleUse,
            multiUse,
            totalUses,
        ] = await Promise.all([
            prisma.promoCodes.count({
                where: { ...where, status: CodeStatus.AVAILABLE },
            }),
            prisma.promoCodes.count({
                where: { ...where, status: CodeStatus.ALLOCATED },
            }),
            prisma.promoCodes.count({
                where: { ...where, status: CodeStatus.REDEEMED },
            }),
            prisma.promoCodes.count({
                where: { ...where, status: CodeStatus.EXPIRED },
            }),
            prisma.promoCodes.count({ where }),
            prisma.promoCodes.count({
                where: { ...where, isActive: true },
            }),
            prisma.promoCodes.count({
                where: { ...where, isActive: false },
            }),
            prisma.promoCodes.count({
                where: { ...where, maxUses: 1 },
            }),
            prisma.promoCodes.count({
                where: { ...where, maxUses: { gt: 1 } },
            }),
            prisma.promoCodes.aggregate({
                where,
                _sum: { usedCount: true },
            }),
        ]);

        return NextResponse.json({
            available,
            allocated,
            redeemed,
            expired,
            total,
            active,
            inactive,
            singleUse,
            multiUse,
            totalUses: totalUses._sum.usedCount || 0,
            averageUsesPerCode:
                total > 0
                    ? ((totalUses._sum.usedCount || 0) / total).toFixed(2)
                    : "0.00",
        });
    } catch (error: any) {
        console.error("Error fetching inventory:", error);
        return NextResponse.json(
            { error: "Failed to fetch inventory" },
            { status: 500 },
        );
    }
}
