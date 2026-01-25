"use client";

import { useState } from "react";

interface SearchResult {
    redemption?: {
        id: string;
        walletAddress: string;
        txHash: string;
        burnAmount: string;
        createdAt: string;
        promoCode: {
            status: string;
            expiresAt?: string;
        };
    };
    error?: string;
}

export function SearchRedemption() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/redemptions?search=${encodeURIComponent(query)}`,
            );
            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({ error: "Search failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Search Redemption</h3>

            <form onSubmit={handleSearch} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Wallet Address or Transaction Hash
                    </label>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                    {loading ? "Searching..." : "🔍 Search"}
                </button>
            </form>

            {result && (
                <div className="mt-6">
                    {result.error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                            <p className="text-red-800 dark:text-red-200 text-sm">
                                {result.error}
                            </p>
                        </div>
                    ) : result.redemption ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">✅</span>
                                <h4 className="font-semibold text-green-900 dark:text-green-100">
                                    Redemption Found
                                </h4>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Wallet:
                                    </span>
                                    <span className="font-mono text-gray-900 dark:text-white">
                                        {result.redemption.walletAddress.slice(
                                            0,
                                            10,
                                        )}
                                        ...
                                        {result.redemption.walletAddress.slice(
                                            -8,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Tx Hash:
                                    </span>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${result.redemption.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        {result.redemption.txHash.slice(0, 10)}
                                        ...
                                    </a>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Amount:
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {result.redemption.burnAmount}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Date:
                                    </span>
                                    <span className="text-gray-900 dark:text-white">
                                        {new Date(
                                            result.redemption.createdAt,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Code Status:
                                    </span>
                                    <span
                                        className={`font-semibold ${
                                            result.redemption.promoCode
                                                .status === "ALLOCATED"
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        {result.redemption.promoCode.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                No redemption found for this wallet or
                                transaction
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
