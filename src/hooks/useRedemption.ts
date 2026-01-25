"use client";

import { useState, useCallback } from "react";
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import { parseAbi, parseEther } from "viem";
import { config } from "@/lib/config";

// Simplified ABI for burn
const burnAbi = parseAbi(["function burn(uint256 amount)"]);

export function useRedemption() {
    const { address } = useAccount();
    const [step, setStep] = useState<
        "idle" | "burning" | "confirming" | "verifying" | "success" | "error"
    >("idle");
    const [error, setError] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

    const { writeContractAsync } = useWriteContract();

    // Execute burn transaction
    const executeBurn = useCallback(async () => {
        if (!address) return;

        setStep("burning");
        setError(null);

        try {
            // Need to fetch BURN_AMOUNT from config/env on client side
            // Ideally passed as prop or fetched from API
            // For now using hardcoded or env if available to client
            const amount = BigInt(
                process.env.NEXT_PUBLIC_BURN_AMOUNT || "1000000000000000000",
            );

            const hash = await writeContractAsync({
                address: process.env
                    .NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
                abi: burnAbi,
                functionName: "burn",
                args: [amount],
            });

            setTxHash(hash);
            setStep("confirming");
            return hash;
        } catch (err: any) {
            console.error("Burn failed:", err);
            setError(err.message || "Transaction failed");
            setStep("error");
            return null;
        }
    }, [address, writeContractAsync]);

    // Verify and claim
    const verifyAndClaim = useCallback(
        async (hash: string, turnstileToken: string) => {
            setStep("verifying");

            try {
                // 1. Verify Burn
                const verifyRes = await fetch("/api/redeem/verify-burn", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ txHash: hash, turnstileToken }),
                });

                if (!verifyRes.ok) {
                    const data = await verifyRes.json();
                    throw new Error(data.error || "Verification failed");
                }

                // 2. Claim Code
                const claimRes = await fetch("/api/redeem/claim", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ txHash: hash }),
                });

                if (!claimRes.ok) {
                    const data = await claimRes.json();
                    throw new Error(data.error || "Claim failed");
                }

                const data = await claimRes.json();
                setPromoCode(data.promoCode);
                setStep("success");
            } catch (err: any) {
                console.error("Claim failed:", err);
                setError(err.message || "Claim failed");
                setStep("error");
            }
        },
        [],
    );

    return {
        step,
        error,
        promoCode,
        txHash,
        executeBurn,
        verifyAndClaim,
        reset: () => {
            setStep("idle");
            setError(null);
            setPromoCode(null);
            setTxHash(null);
        },
    };
}
