import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { allocatePromoCode } from "@/lib/promo-codes";
import { verifyBurnTransaction } from "@/lib/blockchain";
import { checkDuplicateTransaction } from "@/lib/eligibility";
import { config } from "@/lib/config";
import { type Address } from "viem";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session.address) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { txHash } = await request.json();

        if (!txHash) {
            return NextResponse.json(
                { error: "Transaction hash required" },
                { status: 400 },
            );
        }

        // Re-verify everything securely before allocation
        // 1. Duplicate Check
        const duplicateCheck = await checkDuplicateTransaction(txHash);
        if (duplicateCheck.isDuplicate) {
            return NextResponse.json(
                { error: "Transaction already used." },
                { status: 400 },
            );
        }

        // 2. On-Chain Verification (Double check)
        const verification = await verifyBurnTransaction(
            txHash,
            session.address as Address,
            config.eligibility.burnAmount,
        );

        if (!verification.valid) {
            return NextResponse.json(
                { error: verification.error },
                { status: 400 },
            );
        }

        // 3. Allocate Code
        const allocation = await allocatePromoCode(
            session.address,
            txHash,
            verification.burnAmount!.toString(),
        );

        if (!allocation.success) {
            return NextResponse.json(
                { error: allocation.error },
                { status: 400 },
            );
        }

        return NextResponse.json({
            success: true,
            promoCode: allocation.code,
        });
    } catch (error: any) {
        console.error("Error claiming code:", error);
        return NextResponse.json({ error: "Claim failed" }, { status: 500 });
    }
}
