"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface AuthState {
    address: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export function useAuth(): AuthState {
    const { address: connectedAddress } = useAccount();
    const [state, setState] = useState<AuthState>({
        address: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                // Check if authenticated address matches connected wallet
                const isMatching = connectedAddress && 
                    data.address && 
                    data.address.toLowerCase() === connectedAddress.toLowerCase();
                
                setState({
                    address: data.address,
                    isAuthenticated: data.isAuthenticated && isMatching,
                    isLoading: false,
                });
            })
            .catch(() => {
                setState({
                    address: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            });
    }, [connectedAddress]); // Re-check when connected wallet changes

    return state;
}