/**
 * Centralized configuration with environment variable validation
 */

export const config = {
    // Token Contract
    tokenContract: {
        address: process.env
            .NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
        chainId: parseInt(process.env.TOKEN_CHAIN_ID || "11155111"),
    },

    // Eligibility Rules
    eligibility: {
        minBalance: BigInt(process.env.MIN_BALANCE || "1000000000000000000"),
        burnAmount: BigInt(process.env.BURN_AMOUNT || "1000000000000000000"),
    },

    // Rate Limiting
    rateLimit: {
        ipRequests: parseInt(process.env.RATE_LIMIT_IP_REQUESTS || "5"),
        walletRedemptions: parseInt(
            process.env.RATE_LIMIT_WALLET_REDEMPTIONS || "3",
        ),
        redemptionWindowHours: parseInt(
            process.env.REDEMPTION_WINDOW_HOURS || "24",
        ),
    },

    // Cloudflare Turnstile
    turnstile: {
        siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        secretKey: process.env.TURNSTILE_SECRET_KEY!,
    },

    // RPC URLs
    rpc: {
        testnet: process.env.TESTNET_RPC_URL || undefined,
        mainnet: process.env.MAINNET_RPC_URL || undefined,
    },
};

/**
 * Validate required environment variables
 */
export function validateConfig() {
    const required = [
        "NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS",
        "TOKEN_CHAIN_ID",
        "MIN_BALANCE",
        "BURN_AMOUNT",
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
        "TURNSTILE_SECRET_KEY",
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`,
        );
    }

    // Validate contract address format
    if (!config.tokenContract.address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid TOKEN_CONTRACT_ADDRESS format");
    }
}
