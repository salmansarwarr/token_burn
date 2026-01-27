import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();

        if (!session.adminId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const codes = await prisma.promoCodes.findMany({
            select: {
                id: true,
                status: true,
                maxUses: true,
                usedCount: true,
                campaign: true,
                isActive: true,
                expiresAt: true,
                createdAt: true,
                batchId: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 100, // Limit to most recent 100 codes
        });

        return NextResponse.json({ codes });
    } catch (error: any) {
        console.error("Error fetching promo codes:", error);
        return NextResponse.json(
            { error: "Failed to fetch promo codes" },
            { status: 500 },
        );
    }
}
