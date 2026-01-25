"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export function useSIWE() {
    const { address, chainId } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signIn = async () => {
        if (!address || !chainId) {
            setError("Please connect your wallet first");
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get nonce from server
            const nonceRes = await fetch("/api/auth/nonce");
            const { nonce } = await nonceRes.json();

            // Create SIWE message
            const domain = window.location.host;
            const origin = window.location.origin;
            const message = new SiweMessage({
                domain,
                address,
                statement: "Sign in with Ethereum to the app.",
                uri: origin,
                version: "1",
                chainId,
                nonce,
            });

            const preparedMessage = message.prepareMessage();

            // Sign message
            const signature = await signMessageAsync({
                message: preparedMessage,
            });

            // Verify signature on server
            const verifyRes = await fetch("/api/auth/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message,
                    signature,
                }),
            });

            if (!verifyRes.ok) {
                const data = await verifyRes.json();
                throw new Error(data.error || "Verification failed");
            }

            setIsLoading(false);
            return true;
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
            setIsLoading(false);
            return false;
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setIsLoading(false);
            window.location.href = "/";
        } catch (err) {
            setError("Failed to sign out");
            setIsLoading(false);
        }
    };

    return {
        signIn,
        signOut,
        isLoading,
        error,
    };
}
