"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRedemption } from "@/hooks/useRedemption";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { ConnectWallet } from "@/components/ConnectWallet";
import { StepIndicator } from "@/components/StepIndicator";
import { WarningBanner } from "@/components/WarningBanner";
import { CampaignInfo } from "@/components/CampaignInfo";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";

const REDEMPTION_STEPS = ["Connect", "Verify", "CAPTCHA", "Burn", "Claim"];

export default function RedeemPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { isConnected } = useAccount();
    const {
        step,
        error,
        promoCode,
        txHash,
        executeBurn,
        verifyAndClaim,
        reset,
    } = useRedemption();

    const [eligibility, setEligibility] = useState<any>(null);
    const [loadingEligibility, setLoadingEligibility] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [showBurnWarning, setShowBurnWarning] = useState(false);
    const [copied, setCopied] = useState(false);

    // Map step to step number
    const getCurrentStepNumber = () => {
        if (!isConnected) return 1;
        if (!isAuthenticated) return 2;
        if (step === "idle") return 3;
        if (step === "burning" || step === "confirming") return 4;
        if (step === "verifying" || step === "success") return 5;
        return 1;
    };

    const handleCopyCode = async () => {
        if (!promoCode) return;
        
        try {
            await navigator.clipboard.writeText(promoCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Check eligibility on load
    useEffect(() => {
        if (isAuthenticated) {
            setLoadingEligibility(true);
            fetch("/api/redeem/eligibility")
                .then((res) => res.json())
                .then((data) => {
                    setEligibility(data);
                    setLoadingEligibility(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoadingEligibility(false);
                });
        }
    }, [isAuthenticated]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <StepIndicator
                        currentStep={getCurrentStepNumber()}
                        steps={REDEMPTION_STEPS}
                    />

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-center mb-6">
                            Connect Wallet to Redeem
                        </h1>

                        <CampaignInfo compact />

                        <div className="mt-8 flex flex-col items-center gap-4">
                            <ConnectWallet />
                            {!isConnected && (
                                <p className="text-sm text-gray-500">
                                    Please connect your wallet to continue
                                </p>
                            )}
                            {isConnected && !isAuthenticated && (
                                <p className="text-sm text-gray-500">
                                    Please sign in with Ethereum to verify
                                    ownership
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Step Indicator */}
                <StepIndicator
                    currentStep={getCurrentStepNumber()}
                    steps={REDEMPTION_STEPS}
                />

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-center mb-8">
                            Redeem Promo Code
                        </h1>

                        {/* Step 1: Eligibility Check */}
                        {step === "idle" && !showBurnWarning && (
                            <div className="space-y-6">
                                {loadingEligibility ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">
                                            Checking eligibility...
                                        </p>
                                    </div>
                                ) : eligibility?.eligible ? (
                                    <>
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-3xl">
                                                    ✅
                                                </span>
                                                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                                                    You are eligible!
                                                </h3>
                                            </div>
                                            <p className="text-sm text-green-800 dark:text-green-200">
                                                Your balance:{" "}
                                                <strong>
                                                    {eligibility.balance} tokens
                                                </strong>
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
                                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                                📋 Next Steps
                                            </h3>
                                            <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                                <li>
                                                    Complete CAPTCHA
                                                    verification
                                                </li>
                                                <li>
                                                    Burn{" "}
                                                    {
                                                            BigInt(process.env
                                                            .NEXT_PUBLIC_BURN_AMOUNT || 1) / BigInt(10 ** 18)
                                                    }{" "}
                                                    token(s)
                                                </li>
                                                <li>
                                                    Receive your promo code
                                                    instantly
                                                </li>
                                            </ol>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setShowBurnWarning(true)
                                            }
                                            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all text-lg shadow-lg"
                                        >
                                            🔥 Continue to Burn Tokens
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-3xl">
                                                    ❌
                                                </span>
                                                <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                                                    Not Eligible
                                                </h3>
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                                                {eligibility?.reasons?.map(
                                                    (
                                                        reason: string,
                                                        i: number,
                                                    ) => (
                                                        <li key={i}>
                                                            {reason}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                        <Link
                                            href="/"
                                            className="block text-center text-blue-600 hover:underline"
                                        >
                                            ← Back to Home
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: CAPTCHA & Burn Warning */}
                        {step === "idle" && showBurnWarning && (
                            <div className="space-y-6">
                                <WarningBanner
                                    type="danger"
                                    title="⚠️ IRREVERSIBLE ACTION"
                                    message="Once you burn your tokens, they are permanently destroyed and CANNOT be recovered. Make sure you understand this before proceeding."
                                />

                                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                                    <h3 className="font-semibold mb-4 text-center">
                                        Complete CAPTCHA to Continue
                                    </h3>
                                    <div className="flex justify-center">
                                        <TurnstileWidget
                                            onVerify={(token) => {
                                                setTurnstileToken(token);
                                            }}
                                        />
                                    </div>
                                </div>

                                {turnstileToken && (
                                    <button
                                        onClick={() => executeBurn(turnstileToken)}
                                        className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg"
                                    >
                                        🔥 I Understand - Burn Tokens Now
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        setShowBurnWarning(false);
                                        setTurnstileToken(null);
                                    }}
                                    className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Step 3: Burning Transaction */}
                        {step === "burning" && (
                            <div className="text-center space-y-6 py-8">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
                                <div>
                                    <h2 className="text-xl font-bold mb-2">
                                        Confirm in Your Wallet
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Please approve the burn transaction in
                                        your wallet
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirming Transaction */}
                        {step === "confirming" && (
                            <div className="text-center space-y-6 py-8">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                                <div>
                                    <h2 className="text-xl font-bold mb-2">
                                        Transaction Submitted
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Waiting for blockchain confirmation...
                                    </p>
                                    {txHash && (
                                        <p className="text-xs text-gray-500 font-mono break-all bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                            {txHash}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 5: Verifying */}
                        {step === "verifying" && (
                            <div className="text-center space-y-6 py-8">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
                                <div>
                                    <h2 className="text-xl font-bold mb-2">
                                        Verifying & Allocating Code
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Please wait while we verify your
                                        transaction and allocate your promo
                                        code...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Success */}
                        {step === "success" && promoCode && (
                            <div className="text-center space-y-6 py-4">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    Redemption Successful!
                                </h2>

                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-8 rounded-xl border-4 border-dashed border-gray-300 dark:border-gray-500">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                                        Your Promo Code
                                    </p>
                                    <p className="text-4xl font-mono font-bold tracking-wider select-all mb-4">
                                        {promoCode}
                                    </p>
                                    <button
                                        onClick={handleCopyCode}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                    >
                                        {copied ? "✓ Copied!" : "📋 Copy Code"}
                                    </button>
                                </div>

                                <WarningBanner
                                    type="warning"
                                    title="Save This Code Now!"
                                    message="This code will NOT be shown again. Save it somewhere safe. The code expires in 30 days."
                                />

                                <div className="pt-4 space-y-3">
                                    <Link
                                        href="/dashboard"
                                        className="block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        Go to Dashboard
                                    </Link>
                                    <Link
                                        href="/"
                                        className="block text-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        ← Back to Home
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {step === "error" && (
                            <div className="text-center space-y-6 py-8">
                                <div className="text-6xl mb-4">❌</div>
                                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    Something Went Wrong
                                </h2>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
                                    <p className="text-red-800 dark:text-red-200">
                                        {error ||
                                            "An unexpected error occurred"}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={reset}
                                        className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <Link
                                        href="/"
                                        className="block text-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        ← Back to Home
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
