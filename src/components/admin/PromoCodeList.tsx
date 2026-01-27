"use client";

import { useEffect, useState } from "react";

interface PromoCode {
    id: string;
    status: string;
    maxUses: number;
    usedCount: number;
    campaign: string | null;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
    batchId: string | null;
}

export function PromoCodeList() {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: "all",
        campaign: "",
        isActive: "all",
    });

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        try {
            const res = await fetch("/api/admin/promo-codes/list");
            const data = await res.json();
            setCodes(data.codes || []);
        } catch (error) {
            console.error("Failed to fetch codes:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCodes = codes.filter((code) => {
        if (filter.status !== "all" && code.status !== filter.status)
            return false;
        if (
            filter.campaign &&
            (!code.campaign ||
                !code.campaign
                    .toLowerCase()
                    .includes(filter.campaign.toLowerCase()))
        )
            return false;
        if (filter.isActive === "active" && !code.isActive) return false;
        if (filter.isActive === "inactive" && code.isActive) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                    Promo Code Details ({filteredCodes.length})
                </h3>
                <button
                    onClick={fetchCodes}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                    </label>
                    <select
                        value={filter.status}
                        onChange={(e) =>
                            setFilter({ ...filter, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="REDEEMED">Redeemed</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="ALLOCATED">Allocated</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Active Status
                    </label>
                    <select
                        value={filter.isActive}
                        onChange={(e) =>
                            setFilter({ ...filter, isActive: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Campaign
                    </label>
                    <input
                        type="text"
                        value={filter.campaign}
                        onChange={(e) =>
                            setFilter({ ...filter, campaign: e.target.value })
                        }
                        placeholder="Filter by campaign..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Code List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredCodes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No codes found matching filters
                    </div>
                ) : (
                    filteredCodes.map((code) => (
                        <div
                            key={code.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <StatusBadge status={code.status} />
                                        <ActiveBadge isActive={code.isActive} />
                                        {code.campaign && (
                                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                                                📁 {code.campaign}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Usage:
                                            </span>
                                            <span className="ml-2 font-medium">
                                                {code.usedCount} /{" "}
                                                {code.maxUses}
                                            </span>
                                            {code.maxUses > 1 && (
                                                <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                                                    (Multi-use)
                                                </span>
                                            )}
                                        </div>

                                        {code.expiresAt && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Expires:
                                                </span>
                                                <span className="ml-2 font-medium text-xs">
                                                    {new Date(
                                                        code.expiresAt,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Created:
                                            </span>
                                            <span className="ml-2 font-medium text-xs">
                                                {new Date(
                                                    code.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {code.batchId && (
                                            <div className="col-span-2 md:col-span-1">
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                    Batch:
                                                </span>
                                                <span className="ml-2 font-mono text-xs">
                                                    {code.batchId.substring(
                                                        0,
                                                        8,
                                                    )}
                                                    ...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors = {
        AVAILABLE:
            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        REDEEMED:
            "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
        EXPIRED:
            "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
        ALLOCATED:
            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    };

    return (
        <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700"}`}
        >
            {status}
        </span>
    );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
    return (
        <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
                isActive
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            }`}
        >
            {isActive ? "● Active" : "○ Inactive"}
        </span>
    );
}
