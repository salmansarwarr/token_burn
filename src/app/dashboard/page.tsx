"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSIWE } from "@/hooks/useSIWE";
import { useAccount } from "wagmi";
import { RedemptionStatus } from "@/components/RedemptionStatus";
import Link from "next/link";
import { useEffect } from "react";

export default function Dashboard() {
    const { address, isAuthenticated, isLoading } = useAuth();
    const { signOut } = useSIWE();
    const { isConnected, address: connectedAddress } = useAccount();

    // Check for address mismatch
    const addressMismatch =
        address &&
        connectedAddress &&
        address.toLowerCase() !== connectedAddress.toLowerCase();

    useEffect(() => {
        // Auto sign out if addresses don't match
        if (addressMismatch) {
            signOut();
        }
    }, [addressMismatch, signOut]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || addressMismatch) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p>
                        {addressMismatch
                            ? "Wallet address mismatch. Please sign in again."
                            : "Please sign in to access the dashboard"}
                    </p>
                    <Link href="/" className="text-blue-600 hover:underline">
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your account and view redemption status
                    </p>
                </div>

                {/* Redemption Status */}
                <RedemptionStatus />

                {/* Account Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Account Information
                    </h2>

                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                                Authenticated Address
                            </p>
                            <p className="font-mono text-sm text-green-900 dark:text-green-100 break-all">
                                {address}
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                Wallet Status
                            </p>
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                {isConnected
                                    ? "🟢 Connected"
                                    : "🔴 Disconnected"}
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
                                Session Status
                            </p>
                            <p className="text-sm text-purple-900 dark:text-purple-100">
                                ✅ Authenticated via SIWE (EIP-4361)
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <button
                            onClick={signOut}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Protected Content Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Protected Content
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        This page is only accessible to authenticated users.
                        Your session is stored securely server-side with
                        httpOnly cookies.
                    </p>
                </div>
            </div>
        </main>
    );
}
