"use client";

import { InventoryStats } from "@/components/admin/InventoryStats";
import { CSVUpload } from "@/components/admin/CSVUpload";

export default function AdminPromoCodes() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Promo Code Management
                    </h1>
                    <a
                        href="/admin/dashboard"
                        className="text-blue-600 hover:underline"
                    >
                        ← Back to Dashboard
                    </a>
                </div>

                <InventoryStats />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <CSVUpload />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">
                            Export Data
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h4 className="font-medium mb-2">
                                    Redemption History
                                </h4>
                                <p className="text-sm text-gray-500 mb-4">
                                    Export a CSV of all successful redemptions
                                    including wallet addresses and transaction
                                    hashes.
                                </p>
                                <a
                                    href="/api/admin/export/redemptions"
                                    target="_blank"
                                    className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Download CSV
                                </a>
                            </div>

                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h4 className="font-medium mb-2">
                                    Promo Code Usage
                                </h4>
                                <p className="text-sm text-gray-500 mb-4">
                                    Export a CSV of all promo codes and their
                                    current status.
                                </p>
                                <a
                                    href="/api/admin/export/promo-codes"
                                    target="_blank"
                                    className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Download CSV
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
