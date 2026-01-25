"use client";

import { useEffect, useState } from "react";

interface AuthState {
    address: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export function useAuth(): AuthState {
    const [state, setState] = useState<AuthState>({
        address: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                setState({
                    address: data.address,
                    isAuthenticated: data.isAuthenticated,
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
    }, []);

    return state;
}
