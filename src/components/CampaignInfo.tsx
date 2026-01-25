"use client";

interface CampaignInfoProps {
    compact?: boolean;
}

export function CampaignInfo({ compact = false }: CampaignInfoProps) {
    const burnAmount = process.env.NEXT_PUBLIC_BURN_AMOUNT || "1";
    const campaignName =
        process.env.NEXT_PUBLIC_CAMPAIGN_NAME ||
        "Token Burn Redemption Campaign";
    const campaignDescription =
        process.env.NEXT_PUBLIC_CAMPAIGN_DESCRIPTION ||
        "Burn tokens to receive exclusive promo codes";

    if (compact) {
        return (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    🔥 How It Works
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Burn {burnAmount} token(s) to receive a single-use promo
                    code. This action is <strong>irreversible</strong>.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-4">
                <div className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                        🔥 Limited Time Campaign
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                    {campaignName}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    {campaignDescription}
                </p>
            </div>

            {/* What You Get */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    What You'll Receive
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center space-y-2">
                        <div className="text-4xl">🎟️</div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Exclusive Promo Code
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Single-use code for products or services
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-4xl">⚡</div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Instant Delivery
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Code issued immediately after verification
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-4xl">🔒</div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Fair & Secure
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            One redemption per wallet, fraud prevention
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    How It Works
                </h2>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Connect Your Wallet
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Use MetaMask, WalletConnect, or other supported
                                wallets
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Sign In with Ethereum
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Verify wallet ownership (no gas fees)
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Complete CAPTCHA
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Verify you're human to prevent bot abuse
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                            4
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Burn {burnAmount} Token(s)
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Permanently destroy tokens (requires gas fees)
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                            5
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Receive Your Code
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Get your promo code instantly (shown once only!)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Warnings */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6">
                <div className="flex gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-yellow-900 dark:text-yellow-200">
                            Important Information
                        </h3>
                        <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
                            <li>
                                <strong>Irreversible:</strong> Burned tokens
                                cannot be recovered
                            </li>
                            <li>
                                <strong>One-time:</strong> Each wallet can only
                                redeem once
                            </li>
                            <li>
                                <strong>Save your code:</strong> Promo codes are
                                shown only once
                            </li>
                            <li>
                                <strong>Expiration:</strong> Codes expire after
                                30 days
                            </li>
                            <li>
                                <strong>Gas fees:</strong> You'll pay network
                                fees for the burn transaction
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
