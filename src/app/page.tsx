"use client";

import { ConnectWallet } from "@/components/ConnectWallet";
import { CampaignInfo } from "@/components/CampaignInfo";
import { useSIWE } from "@/hooks/useSIWE";
import { useAuth } from "@/hooks/useAuth";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
    const { isConnected } = useAccount();
    const { signIn, isLoading, error } = useSIWE();
    const { isAuthenticated } = useAuth();
    const [stats, setStats] = useState<any>(null);

    // Fetch campaign stats
    useEffect(() => {
        fetch("/api/campaign/stats")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(() => {});
    }, []);

    const handleSignIn = async () => {
        const success = await signIn();
        if (success) {
            window.location.href = "/redeem";
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Campaign Information */}
                <CampaignInfo />

                {/* Campaign Stats */}
                {stats && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.available || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Codes Available
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {stats.redeemed || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Redeemed
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.burnAmount || "1"}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Tokens to Burn
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {stats.daysLeft || "—"}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Days Left
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200 dark:border-gray-700">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Ready to Redeem?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Connect your wallet to get started
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <ConnectWallet />

                        {isConnected && !isAuthenticated && (
                            <button
                                onClick={handleSignIn}
                                disabled={isLoading}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors text-lg shadow-lg"
                            >
                                {isLoading
                                    ? "Signing..."
                                    : "Sign In with Ethereum"}
                            </button>
                        )}

                        {isAuthenticated && (
                            <Link
                                href="/redeem"
                                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition-all text-lg shadow-lg"
                            >
                                🔥 Burn Tokens & Redeem Code
                            </Link>
                        )}

                        {error && (
                            <p className="text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Powered by SIWE (EIP-4361), wagmi, and ConnectKit
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="text-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <Link
                        href="/dashboard"
                        className="hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        Dashboard
                    </Link>
                    <span>•</span>
                    <Link
                        href="/admin/login"
                        className="hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        Admin Login
                    </Link>
                </div>
            </div>
        </main>
    );
}
