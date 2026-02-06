"use client";

import Link from "next/link";
import { CertikEmblem } from "./CertikEmblem";

interface HeaderProps {
    showHomeLink?: boolean;
}

export function Header({ showHomeLink = false }: HeaderProps) {
    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        Nossa Rewards
                    </Link>
                    <CertikEmblem />
                </div>

                {showHomeLink ? (
                    <Link
                        href="/"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/token-distribution"
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Token Distribution
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
