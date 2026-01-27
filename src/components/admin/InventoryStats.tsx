"use client";

import { useEffect, useState } from "react";

export function InventoryStats() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/promo-codes/inventory")
            .then((res) => res.json())
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse space-y-4 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 dark:bg-gray-700 h-24 rounded-xl"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6 mb-8">
            {/* Main Status Stats */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Code Status
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard
                        label="Available"
                        value={stats.available}
                        color="green"
                        icon="✓"
                    />
                    <StatCard
                        label="Redeemed"
                        value={stats.redeemed}
                        color="purple"
                        icon="★"
                    />
                    <StatCard
                        label="Expired"
                        value={stats.expired}
                        color="orange"
                        icon="⏰"
                    />
                    <StatCard
                        label="Allocated"
                        value={stats.allocated}
                        color="blue"
                        icon="⊙"
                    />
                    <StatCard
                        label="Total Codes"
                        value={stats.total}
                        color="gray"
                        icon="∑"
                    />
                </div>
            </div>

            {/* Active/Inactive Stats */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Active Status
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <StatCard
                        label="Active Codes"
                        value={stats.active}
                        color="green"
                        icon="●"
                        subtitle="Ready to use"
                    />
                    <StatCard
                        label="Inactive Codes"
                        value={stats.inactive}
                        color="red"
                        icon="○"
                        subtitle="Disabled by admin"
                    />
                </div>
            </div>

            {/* Usage Type Stats */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Usage Type
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <StatCard
                        label="Single-Use Codes"
                        value={stats.singleUse}
                        color="blue"
                        icon="1"
                        subtitle="maxUses = 1"
                    />
                    <StatCard
                        label="Multi-Use Codes"
                        value={stats.multiUse}
                        color="indigo"
                        icon="∞"
                        subtitle="maxUses > 1"
                    />
                </div>
            </div>

            {/* Usage Statistics */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Usage Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <StatCard
                        label="Total Redemptions"
                        value={stats.totalUses}
                        color="purple"
                        icon="📊"
                        subtitle="All-time uses"
                    />
                    <StatCard
                        label="Avg Uses Per Code"
                        value={stats.averageUsesPerCode}
                        color="teal"
                        icon="📈"
                        subtitle="Efficiency metric"
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    color,
    icon,
    subtitle,
}: {
    label: string;
    value: number | string;
    color: string;
    icon: string;
    subtitle?: string;
}) {
    const colorClasses = {
        green: "text-green-600 bg-green-50 dark:bg-green-900/20",
        purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
        gray: "text-gray-600 bg-gray-50 dark:bg-gray-700",
        red: "text-red-600 bg-red-50 dark:bg-red-900/20",
        indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
        teal: "text-teal-600 bg-teal-50 dark:bg-teal-900/20",
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {label}
                </p>
                <span
                    className={`text-lg ${colorClasses[color as keyof typeof colorClasses]}`}
                >
                    {icon}
                </span>
            </div>
            <p
                className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses].split(" ")[0]}`}
            >
                {value}
            </p>
            {subtitle && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
