import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getEligibilityStatus } from "@/lib/eligibility";
import { type Address } from "viem";

export async function GET() {
    try {
        const session = await getSession();

        if (!session.address) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const status = await getEligibilityStatus(session.address as Address);

        return NextResponse.json({
            eligible: status.eligible,
            balance: status.balance?.toString() || "0",
            reasons: status.reasons,
            nextEligible: status.nextEligible,
        });
    } catch (error: any) {
        console.error("Error checking eligibility:", error);
        return NextResponse.json(
            { error: "Failed to check eligibility" },
            { status: 500 },
        );
    }
}
