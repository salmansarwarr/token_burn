import { type Address, type Hash } from "viem";
import { prisma } from "./prisma";
import { getTokenBalance } from "./blockchain";
import { config } from "./config";

/**
 * Check if wallet meets minimum balance requirement
 */
export async function checkMinBalance(address: Address): Promise<{
    eligible: boolean;
    balance: bigint;
    required: bigint;
}> {
    const balance = await getTokenBalance(address);
    const required = config.eligibility.minBalance;

    return {
        eligible: balance >= required,
        balance,
        required,
    };
}

/**
 * Check if burn amount matches required amount
 */
export function checkBurnAmount(amount: bigint): {
    valid: boolean;
    amount: bigint;
    required: bigint;
} {
    const required = config.eligibility.burnAmount;

    return {
        valid: amount === required,
        amount,
        required,
    };
}

/**
 * Check if wallet is within redemption window (cooldown period)
 */
export async function checkRedemptionWindow(walletAddress: string): Promise<{
    eligible: boolean;
    lastRedemption?: Date;
    nextEligible?: Date;
}> {
    const windowHours = config.rateLimit.redemptionWindowHours;

    // Find most recent redemption
    const lastRedemption = await prisma.redemptions.findFirst({
        where: { walletAddress: walletAddress.toLowerCase() },
        orderBy: { createdAt: "desc" },
    });

    if (!lastRedemption) {
        return { eligible: true };
    }

    const now = new Date();
    const windowMs = windowHours * 60 * 60 * 1000;
    const nextEligible = new Date(
        lastRedemption.createdAt.getTime() + windowMs,
    );

    return {
        eligible: now >= nextEligible,
        lastRedemption: lastRedemption.createdAt,
        nextEligible,
    };
}

/**
 * Check if transaction hash has already been used
 */
export async function checkDuplicateTransaction(txHash: Hash): Promise<{
    isDuplicate: boolean;
    existingRedemption?: any;
}> {
    const existing = await prisma.redemptions.findUnique({
        where: { txHash: txHash.toLowerCase() },
        include: { promoCode: true },
    });

    return {
        isDuplicate: !!existing,
        existingRedemption: existing,
    };
}

/**
 * Get comprehensive eligibility status for a wallet
 */
export async function getEligibilityStatus(address: Address): Promise<{
    eligible: boolean;
    reasons: string[];
    balance?: bigint;
    nextEligible?: Date;
}> {
    const reasons: string[] = [];

    // Check minimum balance
    const balanceCheck = await checkMinBalance(address);
    if (!balanceCheck.eligible) {
        reasons.push(
            `Insufficient balance: ${balanceCheck.balance.toString()} (required: ${balanceCheck.required.toString()})`,
        );
    }

    // Check redemption window
    const windowCheck = await checkRedemptionWindow(address);
    if (!windowCheck.eligible) {
        reasons.push(
            `Redemption cooldown active until ${windowCheck.nextEligible?.toISOString()}`,
        );
    }

    return {
        eligible: reasons.length === 0,
        reasons,
        balance: balanceCheck.balance,
        nextEligible: windowCheck.nextEligible,
    };
}
