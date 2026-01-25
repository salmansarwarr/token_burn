import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifyBurnTransaction } from "@/lib/blockchain";
import {
    checkDuplicateTransaction,
    checkRedemptionWindow,
    checkBurnAmount,
} from "@/lib/eligibility";
import { checkIPRateLimit, checkWalletRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
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

        const { txHash, turnstileToken } = await request.json();

        if (!txHash || !turnstileToken) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // 1. CAPTCHA Verification
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const captcha = await verifyTurnstileToken(turnstileToken, ip);
        if (!captcha.success) {
            return NextResponse.json({ error: captcha.error }, { status: 400 });
        }

        // 2. Rate Limiting
        const ipLimit = await checkIPRateLimit(ip);
        if (!ipLimit.allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please try again later." },
                { status: 429 },
            );
        }

        const walletLimit = await checkWalletRateLimit(session.address);
        if (!walletLimit.allowed) {
            return NextResponse.json(
                { error: "Wallet rate limit exceeded." },
                { status: 429 },
            );
        }

        // 3. Redemption Window
        const windowCheck = await checkRedemptionWindow(session.address);
        if (!windowCheck.eligible) {
            return NextResponse.json(
                { error: "Redemption cooldown active." },
                { status: 400 },
            );
        }

        // 4. Duplicate Check
        const duplicateCheck = await checkDuplicateTransaction(txHash);
        if (duplicateCheck.isDuplicate) {
            return NextResponse.json(
                { error: "Transaction already used." },
                { status: 400 },
            );
        }

        // 5. On-Chain Verification
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

        return NextResponse.json({
            verified: true,
            burnAmount: verification.burnAmount?.toString(),
        });
    } catch (error: any) {
        console.error("Error verifying burn:", error);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 },
        );
    }
}
