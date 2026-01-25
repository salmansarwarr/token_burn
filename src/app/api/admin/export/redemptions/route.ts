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

        const redemptions = await prisma.redemptions.findMany({
            orderBy: { createdAt: "desc" },
            include: { promoCode: true },
        });

        const csvRows = [
            [
                "Wallet Address",
                "Tx Hash",
                "Burn Amount",
                "Promo Code Hash",
                "Created At",
            ],
            ...redemptions.map((r) => [
                r.walletAddress,
                r.txHash,
                r.burnAmount,
                r.promoCode?.codeHash || "N/A",
                r.createdAt.toISOString(),
            ]),
        ];

        const csvContent = csvRows.map((row) => row.join(",")).join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": 'attachment; filename="redemptions.csv"',
            },
        });
    } catch (error) {
        console.error("Error exporting redemptions:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
