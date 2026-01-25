"use client";

import { useEffect, useState } from "react";

interface RedemptionRecord {
    id: string;
    walletAddress: string;
    txHash: string;
    burnAmount: string;
    createdAt: string;
}

export function RecentRedemptions() {
    const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        fetchRedemptions();
    }, [page]);

    const fetchRedemptions = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/redemptions?page=${page}&limit=20`,
            );
            const data = await res.json();
            setRedemptions(data.redemptions || []);
            setHasMore(data.hasMore || false);
        } catch (error) {
            console.error("Failed to fetch redemptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const truncateTxHash = (hash: string) => {
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    if (loading && redemptions.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">
                    Recent Redemptions
                </h3>
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                        ></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Recent Redemptions</h3>
                <button
                    onClick={fetchRedemptions}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    🔄 Refresh
                </button>
            </div>

            {redemptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No redemptions yet
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                                        Wallet
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                                        Tx Hash
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                                        Amount
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {redemptions.map((redemption) => (
                                    <tr
                                        key={redemption.id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="py-3 px-2">
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(
                                                        redemption.walletAddress,
                                                    )
                                                }
                                                className="font-mono text-xs hover:text-blue-600 dark:hover:text-blue-400"
                                                title="Click to copy"
                                            >
                                                {truncateAddress(
                                                    redemption.walletAddress,
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-3 px-2">
                                            <a
                                                href={`https://etherscan.io/tx/${redemption.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {truncateTxHash(
                                                    redemption.txHash,
                                                )}
                                            </a>
                                        </td>
                                        <td className="py-3 px-2 font-semibold">
                                            {redemption.burnAmount}
                                        </td>
                                        <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                                            {new Date(
                                                redemption.createdAt,
                                            ).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex justify-between items-center">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Previous
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Page {page}
                        </span>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasMore}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
