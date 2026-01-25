"use client";

import { useState, useCallback, useEffect } from "react";
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import { parseAbi } from "viem";

const burnAbi = parseAbi(["function burn(uint256 amount)"]);

export function useRedemption() {
    const { address } = useAccount();
    const [step, setStep] = useState<
        "idle" | "burning" | "confirming" | "verifying" | "success" | "error"
    >("idle");
    const [error, setError] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const { writeContractAsync } = useWriteContract();

    // Watch for transaction confirmation
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash: txHash || undefined,
        });

    // Auto-trigger verification when transaction is confirmed
    useEffect(() => {
        if (isConfirmed && txHash && turnstileToken && step === "confirming") {
            verifyAndClaim(txHash, turnstileToken);
        }
    }, [isConfirmed, txHash, turnstileToken, step]);

    const executeBurn = useCallback(async (captchaToken: string) => {
        if (!address) return;

        setStep("burning");
        setError(null);
        setTurnstileToken(captchaToken);

        try {
            const amount = BigInt(
                process.env.NEXT_PUBLIC_BURN_AMOUNT || "1000000000000000000",
            );

            const hash = await writeContractAsync({
                address: process.env
                    .NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
                abi: burnAbi,
                functionName: "burn",
                args: [amount],
                gas: BigInt("150000"),
            });

            setTxHash(hash);
            setStep("confirming");
            return hash;
        } catch (err: any) {
            console.error("Burn failed:", err);
            
            if (err.message?.includes("gas limit")) {
                setError("Transaction gas limit exceeded. Please try again.");
            } else if (err.message?.includes("rejected")) {
                setError("Transaction rejected by user.");
            } else {
                setError(err.message || "Transaction failed");
            }
            
            setStep("error");
            return null;
        }
    }, [address, writeContractAsync]);

    const verifyAndClaim = useCallback(
        async (hash: string, captchaToken: string) => {
            setStep("verifying");

            try {
                const verifyRes = await fetch("/api/redeem/verify-burn", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ txHash: hash, turnstileToken: captchaToken }),
                });

                if (!verifyRes.ok) {
                    const data = await verifyRes.json();
                    throw new Error(data.error || "Verification failed");
                }

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
            setTurnstileToken(null);
        },
    };
}