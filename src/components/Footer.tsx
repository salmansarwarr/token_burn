"use client";

import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
                        <strong>Disclaimer:</strong> Nothing on this website
                        constitutes financial advice or an offer to buy
                        securities. NRWD is intended for use within the rewards
                        ecosystem and is not an investment; holding NRWD does
                        not imply any expectation of profit or ownership rights.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>
                            © {new Date().getFullYear()} Nossa Rewards. All
                            rights reserved.
                        </span>
                        <span>•</span>
                        <Link
                            href="/privacy-policy"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
