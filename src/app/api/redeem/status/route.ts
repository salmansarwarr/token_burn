import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();

        if (!session.address) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Check if wallet has redeemed
        const redemption = await prisma.redemptions.findFirst({
            where: {
                walletAddress: session.address.toLowerCase(),
            },
            include: {
                promoCode: {
                    select: {
                        expiresAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!redemption) {
            return NextResponse.json({
                hasRedeemed: false,
            });
        }

        // Format burn amount (assuming 18 decimals)
        const burnAmountFormatted = (
            BigInt(redemption.burnAmount) / BigInt(10 ** 18)
        ).toString();

        return NextResponse.json({
            hasRedeemed: true,
            redemption: {
                txHash: redemption.txHash,
                burnAmount: burnAmountFormatted,
                createdAt: redemption.createdAt.toISOString(),
                expiresAt: redemption.promoCode.expiresAt?.toISOString(),
            },
        });
    } catch (error: any) {
        console.error("Error fetching redemption status:", error);
        return NextResponse.json(
            { error: "Failed to fetch status" },
            { status: 500 },
        );
    }
}
