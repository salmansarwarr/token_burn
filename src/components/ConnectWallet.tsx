"use client";

import { ConnectKitButton } from "connectkit";

export function ConnectWallet() {
    return (
        <ConnectKitButton.Custom>
            {({ isConnected, show, truncatedAddress, ensName }) => {
                return (
                    <button
                        onClick={show}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        {isConnected
                            ? (ensName ?? truncatedAddress)
                            : "Connect Wallet"}
                    </button>
                );
            }}
        </ConnectKitButton.Custom>
    );
}
