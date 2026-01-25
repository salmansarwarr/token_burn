"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RedemptionData {
    hasRedeemed: boolean;
    redemption?: {
        txHash: string;
        burnAmount: string;
        createdAt: string;
        expiresAt?: string;
    };
}

export function RedemptionStatus() {
    const [data, setData] = useState<RedemptionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/redeem/status")
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    if (!data.hasRedeemed) {
        return (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-4">
                    <div className="text-4xl">🔥</div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Ready to Redeem?
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            You haven't redeemed your promo code yet. Burn
                            tokens to get your exclusive code!
                        </p>
                        <Link
                            href="/redeem"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all shadow-lg"
                        >
                            Redeem Now →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { redemption } = data;
    if (!redemption) return null;

    const redemptionDate = new Date(redemption.createdAt);
    const expirationDate = redemption.expiresAt
        ? new Date(redemption.expiresAt)
        : null;
    const isExpired = expirationDate && expirationDate < new Date();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">{isExpired ? "⏰" : "✅"}</div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {isExpired ? "Code Expired" : "Already Redeemed"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        You redeemed your promo code on{" "}
                        {redemptionDate.toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Transaction Hash
                    </span>
                    <a
                        href={`https://sepolia.etherscan.io/tx/${redemption.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {redemption.txHash.slice(0, 10)}...
                        {redemption.txHash.slice(-8)}
                    </a>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Tokens Burned
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {redemption.burnAmount}
                    </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Redeemed On
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {redemptionDate.toLocaleString()}
                    </span>
                </div>

                {expirationDate && (
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Code {isExpired ? "Expired" : "Expires"}
                        </span>
                        <span
                            className={`text-sm font-semibold ${
                                isExpired
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-gray-900 dark:text-white"
                            }`}
                        >
                            {expirationDate.toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {!isExpired && (
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        ℹ️ Your promo code was displayed once during redemption.
                        If you didn't save it, please contact support.
                    </p>
                </div>
            )}
        </div>
    );
}
