"use client";

import { useState } from "react";
import Link from "next/link";

const TREASURY_ADDRESS = "0xC6C1BCa45ae7836EFCf252a93eb378957E79150A";
const SIGNERS = [
    {
        id: 1,
        address: "0x291542488C708994A81e39Bbd68615B5da99e7AA",
        label: "Signer 1",
    },
    {
        id: 2,
        address: "0x6c9d412E984978F9C60a834a059EE3bAC1563962",
        label: "Signer 2",
    },
    {
        id: 3,
        address: "0x0bBD6fa988d7e422bec30907b9E62ad6b8A06d1b",
        label: "Signer 3",
    },
];

export default function TokenDistributionPage() {
    const [copiedAddress, setCopiedAddress] = useState(null);

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopiedAddress(label);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        Nossa Rewards
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Token Distribution Plan
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Nossa Rewards (NRWD) — Transparent Treasury Management
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        This plan describes the initial treasury custody and
                        distribution framework
                    </p>
                </div>

                {/* Token Identification */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="text-3xl mr-3">🪙</span>
                        Token Identification
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard label="Name" value="Nossa Rewards" />
                        <InfoCard label="Symbol" value="NRWD" />
                        <InfoCard
                            label="Standard"
                            value="ERC-20 (Ethereum compatible)"
                        />
                        <InfoCard
                            label="Total Supply"
                            value="200,000,000,000 NRWD"
                            highlight
                        />
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                            <strong>Issuance Policy:</strong> 100% of the total
                            supply is minted once at deployment and assigned
                            directly to the treasury. This is a fixed supply
                            token.
                        </p>
                    </div>
                </section>

                {/* Issuer */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="text-3xl mr-3">🏢</span>
                        Issuer
                    </h2>
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            SAS Rabdan Global Holding Ltd
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Treasury operations are executed through the
                            multi-signature treasury
                        </p>
                    </div>
                </section>

                {/* Multi-Sig Treasury */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="text-3xl mr-3">🔐</span>
                        Treasury & Institutional Control (Multi-Sig)
                    </h2>

                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-900 dark:text-green-200">
                            <strong>Security Feature:</strong> To mitigate
                            centralization risk and "single point of failure"
                            risk, the token treasury is controlled by a
                            multi-signature wallet (Safe multi-sig).
                        </p>
                    </div>

                    {/* Treasury Address */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Treasury (Safe Multi-Sig) — NRWD Treasury
                        </h3>
                        <AddressCard
                            address={TREASURY_ADDRESS}
                            label="Treasury"
                            onCopy={copyToClipboard}
                            copied={copiedAddress === "Treasury"}
                            primary
                        />
                    </div>

                    {/* Threshold */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                            <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-2">
                                Threshold (Required Approval)
                            </p>
                            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                                2 of 3 (2/3)
                            </p>
                        </div>
                        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-2">
                                Operational Rule
                            </p>
                            <p className="text-sm text-purple-900 dark:text-purple-100">
                                Any movement from the treasury requires a
                                minimum of <strong>2 signatures</strong>
                            </p>
                        </div>
                    </div>

                    {/* Signers */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Owners / Signers (3 addresses)
                        </h3>
                        <div className="space-y-3">
                            {SIGNERS.map((signer) => (
                                <AddressCard
                                    key={signer.id}
                                    address={signer.address}
                                    label={signer.label}
                                    onCopy={copyToClipboard}
                                    copied={copiedAddress === signer.label}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Operational Distribution Policy */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <span className="text-3xl mr-3">📋</span>
                        Operational Distribution Policy
                    </h2>
                    <ul className="space-y-4">
                        <PolicyItem
                            icon="🏦"
                            text="Undistributed supply is held under custody of the multi-signature treasury."
                        />
                        <PolicyItem
                            icon="🔒"
                            text="There is no single-key treasury control: any distribution, operational transfer, or treasury movement requires multi-signature approval (2/3)."
                        />
                        <PolicyItem
                            icon="🔍"
                            text="Treasury movements are traceable on-chain."
                        />
                    </ul>
                </section>

                {/* Transparency */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <span className="text-3xl mr-3">✨</span>
                        Transparency (For Public Verification)
                    </h2>
                    <p className="text-blue-100 mb-6">
                        The treasury (Safe) address and signer addresses are
                        published to allow public verification of
                        multi-signature control and treasury balance.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href={`https://etherscan.io/address/${TREASURY_ADDRESS}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            <span className="mr-2">🔗</span>
                            View Treasury on Etherscan
                        </a>
                        <a
                            href={`https://app.safe.global/home?safe=eth:${TREASURY_ADDRESS}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                        >
                            <span className="mr-2">🛡️</span>
                            View on Safe App
                        </a>
                    </div>
                </section>

                {/* Footer Note */}
                <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        This plan may be updated subject to approvals by the
                        multi-signature treasury.
                    </p>
                    <p className="mt-2">
                        Last updated: January 2026 • Version 1.0
                    </p>
                </div>
            </main>
        </div>
    );
}

// Helper Components
function InfoCard({ label, value, highlight }) {
    return (
        <div
            className={`p-4 rounded-lg border ${
                highlight
                    ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
            }`}
        >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {label}
            </p>
            <p
                className={`text-lg font-semibold ${
                    highlight
                        ? "text-orange-900 dark:text-orange-100"
                        : "text-gray-900 dark:text-white"
                }`}
            >
                {value}
            </p>
        </div>
    );
}

function AddressCard({ address, label, onCopy, copied, primary }) {
    return (
        <div
            className={`p-4 rounded-lg border ${
                primary
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-300 dark:border-blue-700"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
            }`}
        >
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </p>
                <button
                    onClick={() => onCopy(address, label)}
                    className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
            </div>
            <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                {address}
            </p>
        </div>
    );
}

function PolicyItem({ icon, text }) {
    return (
        <li className="flex items-start">
            <span className="text-2xl mr-3 flex-shrink-0">{icon}</span>
            <p className="text-gray-700 dark:text-gray-300 pt-1">{text}</p>
        </li>
    );
}
