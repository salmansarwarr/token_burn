"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InventoryStats } from "@/components/admin/InventoryStats";
import { RecentRedemptions } from "@/components/admin/RecentRedemptions";
import { SearchRedemption } from "@/components/admin/SearchRedemption";
import Link from "next/link";

interface AdminStats {
    total: number;
    available: number;
    allocated: number;
    expired: number;
    redeemed: number;
    daysLeft: number | null;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<AdminStats | null>(null);

    useEffect(() => {
        // Check admin authentication
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (!data.adminId) {
                    router.push("/admin/login");
                } else {
                    setAdmin(data);
                    setIsLoading(false);
                    // Fetch stats
                    fetchStats();
                }
            })
            .catch(() => {
                router.push("/admin/login");
            });
    }, [router]);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage campaign and monitor redemptions
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Campaign Statistics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Total Codes
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="text-4xl">📦</div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Available
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {stats.available}
                                    </p>
                                </div>
                                <div className="text-4xl">✅</div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Redeemed
                                    </p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {stats.redeemed}
                                    </p>
                                </div>
                                <div className="text-4xl">🎉</div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        Days Left
                                    </p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                        {stats.daysLeft ?? "—"}
                                    </p>
                                </div>
                                <div className="text-4xl">⏰</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/admin/dashboard/promo-codes"
                            className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🎟️</span>
                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                        Manage Promo Codes
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Upload and manage codes
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <button
                            onClick={fetchStats}
                            className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🔄</span>
                                <div>
                                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                                        Refresh Stats
                                    </h3>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Update dashboard data
                                    </p>
                                </div>
                            </div>
                        </button>

                        <Link
                            href="/"
                            className="p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🏠</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        View Campaign
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Go to public page
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Redemptions and Search */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <RecentRedemptions />
                    </div>
                    <div>
                        <SearchRedemption />
                    </div>
                </div>

                {/* Inventory Details */}
                <InventoryStats />
            </div>
        </main>
    );
}
