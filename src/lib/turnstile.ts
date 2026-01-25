import { config } from "./config";

/**
 * Verify Cloudflare Turnstile token
 */
export async function verifyTurnstileToken(
    token: string,
    ip: string,
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    secret: config.turnstile.secretKey,
                    response: token,
                    remoteip: ip,
                }),
            },
        );

        const data = await response.json();

        if (!data.success) {
            return {
                success: false,
                error:
                    data["error-codes"]?.join(", ") ||
                    "CAPTCHA verification failed",
            };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Turnstile verification error:", error);
        return {
            success: false,
            error: "CAPTCHA verification service unavailable",
        };
    }
}
