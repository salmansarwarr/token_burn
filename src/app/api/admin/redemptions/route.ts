import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        // Check admin authentication
        if (!session.adminId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // Search mode
        if (search) {
            const searchLower = search.toLowerCase();

            const redemption = await prisma.redemptions.findFirst({
                where: {
                    OR: [
                        { walletAddress: searchLower },
                        { txHash: searchLower },
                    ],
                },
                include: {
                    promoCode: {
                        select: {
                            status: true,
                            expiresAt: true,
                        },
                    },
                },
            });

            if (!redemption) {
                return NextResponse.json({
                    redemption: null,
                    error: "No redemption found",
                });
            }

            // Format burn amount
            const burnAmountFormatted = (
                BigInt(redemption.burnAmount) / BigInt(10 ** 18)
            ).toString();

            return NextResponse.json({
                redemption: {
                    id: redemption.id,
                    walletAddress: redemption.walletAddress,
                    txHash: redemption.txHash,
                    burnAmount: burnAmountFormatted,
                    createdAt: redemption.createdAt.toISOString(),
                    promoCode: {
                        status: redemption.promoCode.status,
                        expiresAt:
                            redemption.promoCode.expiresAt?.toISOString(),
                    },
                },
            });
        }

        // List mode with pagination
        const skip = (page - 1) * limit;

        const [redemptions, total] = await Promise.all([
            prisma.redemptions.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    walletAddress: true,
                    txHash: true,
                    burnAmount: true,
                    createdAt: true,
                },
            }),
            prisma.redemptions.count(),
        ]);

        const formattedRedemptions = redemptions.map((r) => ({
            id: r.id,
            walletAddress: r.walletAddress,
            txHash: r.txHash,
            burnAmount: (BigInt(r.burnAmount) / BigInt(10 ** 18)).toString(),
            createdAt: r.createdAt.toISOString(),
        }));

        return NextResponse.json({
            redemptions: formattedRedemptions,
            total,
            page,
            limit,
            hasMore: skip + limit < total,
        });
    } catch (error: any) {
        console.error("Error fetching redemptions:", error);
        return NextResponse.json(
            { error: "Failed to fetch redemptions" },
            { status: 500 },
        );
    }
}
