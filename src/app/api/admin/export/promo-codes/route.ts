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
            orderBy: { createdAt: "desc" },
            include: { redemptions: true },
        });

        const csvRows = [
            [
                "Code Hash",
                "Status",
                "Batch ID",
                "Expires At",
                "Redeemed By",
                "Redeemed At",
            ],
            ...codes.map((c) => [
                c.codeHash,
                c.status,
                c.batchId || "",
                c.expiresAt?.toISOString() || "",
                c.redemptions[0]?.walletAddress || "",
                c.redemptions[0]?.createdAt.toISOString() || "",
            ]),
        ];

        const csvContent = csvRows.map((row) => row.join(",")).join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": 'attachment; filename="promo-codes.csv"',
            },
        });
    } catch (error) {
        console.error("Error exporting promo codes:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
