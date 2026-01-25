import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CodeStatus } from "@prisma/client";

export async function GET() {
    try {
        const session = await getSession();

        if (!session.adminId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const [available, allocated, redeemed, expired, total] =
            await Promise.all([
                prisma.promoCodes.count({
                    where: { status: CodeStatus.AVAILABLE },
                }),
                prisma.promoCodes.count({
                    where: { status: CodeStatus.ALLOCATED },
                }),
                prisma.promoCodes.count({
                    where: { status: CodeStatus.REDEEMED },
                }),
                prisma.promoCodes.count({
                    where: { status: CodeStatus.EXPIRED },
                }),
                prisma.promoCodes.count(),
            ]);

        return NextResponse.json({
            available,
            allocated,
            redeemed,
            expired,
            total,
        });
    } catch (error: any) {
        console.error("Error fetching inventory:", error);
        return NextResponse.json(
            { error: "Failed to fetch inventory" },
            { status: 500 },
        );
    }
}
