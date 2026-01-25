"use client";

import { useEffect, useState } from "react";

export function InventoryStats() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/promo-codes/inventory")
            .then((res) => res.json())
            .then(setStats)
            .catch(console.error);
    }, []);

    if (!stats) return <div>Loading stats...</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold text-green-600">
                    {stats.available}
                </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">Allocated</p>
                <p className="text-2xl font-bold text-blue-600">
                    {stats.allocated}
                </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">Redeemed</p>
                <p className="text-2xl font-bold text-purple-600">
                    {stats.redeemed}
                </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                </p>
            </div>
        </div>
    );
}
