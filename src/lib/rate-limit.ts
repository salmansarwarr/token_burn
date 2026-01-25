import { prisma } from "./prisma";
import { config } from "./config";

/**
 * Check and increment IP-based rate limit
 */
export async function checkIPRateLimit(ip: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}> {
    const limit = config.rateLimit.ipRequests;
    const windowMs = 60 * 1000; // 1 minute

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Clean up expired entries
    await prisma.rateLimitEntry.deleteMany({
        where: {
            expiresAt: { lt: now },
        },
    });

    // Get or create rate limit entry
    const entry = await prisma.rateLimitEntry.findUnique({
        where: {
            identifier_type: {
                identifier: ip,
                type: "ip",
            },
        },
    });

    if (!entry) {
        // Create new entry
        await prisma.rateLimitEntry.create({
            data: {
                identifier: ip,
                type: "ip",
                count: 1,
                windowStart: now,
                expiresAt: new Date(now.getTime() + windowMs),
            },
        });

        return {
            allowed: true,
            remaining: limit - 1,
            resetAt: new Date(now.getTime() + windowMs),
        };
    }

    // Check if window has expired
    if (entry.windowStart < windowStart) {
        // Reset window
        await prisma.rateLimitEntry.update({
            where: { id: entry.id },
            data: {
                count: 1,
                windowStart: now,
                expiresAt: new Date(now.getTime() + windowMs),
            },
        });

        return {
            allowed: true,
            remaining: limit - 1,
            resetAt: new Date(now.getTime() + windowMs),
        };
    }

    // Increment count
    if (entry.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.expiresAt,
        };
    }

    await prisma.rateLimitEntry.update({
        where: { id: entry.id },
        data: { count: entry.count + 1 },
    });

    return {
        allowed: true,
        remaining: limit - entry.count - 1,
        resetAt: entry.expiresAt,
    };
}

/**
 * Check and increment wallet-based rate limit
 */
export async function checkWalletRateLimit(walletAddress: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}> {
    const limit = config.rateLimit.walletRedemptions;
    const windowMs = 60 * 60 * 1000; // 1 hour

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Clean up expired entries
    await prisma.rateLimitEntry.deleteMany({
        where: {
            expiresAt: { lt: now },
        },
    });

    const entry = await prisma.rateLimitEntry.findUnique({
        where: {
            identifier_type: {
                identifier: walletAddress.toLowerCase(),
                type: "wallet",
            },
        },
    });

    if (!entry) {
        await prisma.rateLimitEntry.create({
            data: {
                identifier: walletAddress.toLowerCase(),
                type: "wallet",
                count: 1,
                windowStart: now,
                expiresAt: new Date(now.getTime() + windowMs),
            },
        });

        return {
            allowed: true,
            remaining: limit - 1,
            resetAt: new Date(now.getTime() + windowMs),
        };
    }

    if (entry.windowStart < windowStart) {
        await prisma.rateLimitEntry.update({
            where: { id: entry.id },
            data: {
                count: 1,
                windowStart: now,
                expiresAt: new Date(now.getTime() + windowMs),
            },
        });

        return {
            allowed: true,
            remaining: limit - 1,
            resetAt: new Date(now.getTime() + windowMs),
        };
    }

    if (entry.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.expiresAt,
        };
    }

    await prisma.rateLimitEntry.update({
        where: { id: entry.id },
        data: { count: entry.count + 1 },
    });

    return {
        allowed: true,
        remaining: limit - entry.count - 1,
        resetAt: entry.expiresAt,
    };
}

/**
 * Cleanup expired rate limit entries (should be run periodically)
 */
export async function cleanupExpiredEntries(): Promise<number> {
    const result = await prisma.rateLimitEntry.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
        },
    });

    return result.count;
}
