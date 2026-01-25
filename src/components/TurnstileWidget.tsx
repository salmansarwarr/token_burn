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

    useEffect(() => {
        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

        if (!siteKey) {
            console.error("Turnstile site key missing");
            return;
        }

        if (window.turnstile) {
            renderWidget();
        } else {
            const script = document.createElement("script");
            script.src =
                "https://challenges.cloudflare.com/turnstile/v0/api.js";
            script.async = true;
            script.defer = true;
            script.onload = renderWidget;
            document.body.appendChild(script);
        }

        function renderWidget() {
            if (!containerRef.current || widgetId.current) return;

            widgetId.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => onVerify(token),
                "error-callback": (error: any) => onError?.(error),
            });
        }

        return () => {
            if (widgetId.current && window.turnstile) {
                window.turnstile.remove(widgetId.current);
                widgetId.current = null;
            }
        };
    }, [onVerify, onError]);

    return <div ref={containerRef} className="my-4" />;
}
