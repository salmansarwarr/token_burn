"use client";

import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onError?: (error: any) => void;
}

declare global {
    interface Window {
        turnstile: any;
    }
}

export function TurnstileWidget({ onVerify, onError }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const callbacksRef = useRef({ onVerify, onError });

    // Update callbacks ref without triggering effect
    useEffect(() => {
        callbacksRef.current = { onVerify, onError };
    }, [onVerify, onError]);

    useEffect(() => {
        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

        if (!siteKey) {
            console.error("Turnstile site key missing");
            return;
        }

        function renderWidget() {
            if (!containerRef.current || widgetId.current) return;

            widgetId.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => callbacksRef.current.onVerify(token),
                "error-callback": (error: any) => callbacksRef.current.onError?.(error),
            });
        }

        if (window.turnstile) {
            renderWidget();
        } else {
            const script = document.createElement("script");
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
            script.async = true;
            script.defer = true;
            script.onload = renderWidget;
            document.body.appendChild(script);
        }

        return () => {
            if (widgetId.current && window.turnstile) {
                window.turnstile.remove(widgetId.current);
                widgetId.current = null;
            }
        };
    }, []); // Empty dependency array - only run once

    return <div ref={containerRef} className="my-4" />;
}