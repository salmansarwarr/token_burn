import crypto from "crypto";
import { prisma } from "./prisma";
import { CodeStatus } from "@prisma/client";

// Encryption configuration
const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = Buffer.from(process.env.SESSION_SECRET || "", "base64"); // Reusing session secret or need new one?
// Ideally should use a separate key. For now, let's derive one or assume SESSION_SECRET is sufficient length (32 bytes)
// If SESSION_SECRET is not 32 bytes, this will fail.
// Let's add a fallback or check.

function getKey(): Buffer {
    const secret = process.env.SESSION_SECRET;
    if (!secret) throw new Error("SESSION_SECRET required");

    // Ensure 32 bytes
    return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a promo code
 */
export function encryptCode(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypt a promo code
 */
export function decryptCode(text: string): string {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

/**
 * Parse CSV content
 * Supports both old format (code, expiresAt) and new format (code, expiresAt, maxUses, campaign)
 */
export function parseCSV(fileContent: string): {
    code: string;
    expiresAt?: Date;
    maxUses?: number;
    campaign?: string;
}[] {
    const lines = fileContent.split(/\r?\n/);
    const results: {
        code: string;
        expiresAt?: Date;
        maxUses?: number;
        campaign?: string;
    }[] = [];

    // Check if first line is a header
    const firstLine = lines[0]?.trim().toLowerCase();
    const hasHeader = firstLine?.startsWith("code");
    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) continue;

        const parts = trimmed.split(",").map((p) => p.trim());
        const [code, expiresAtStr, maxUsesStr, campaign] = parts;

        if (!code) continue;

        const result: {
            code: string;
            expiresAt?: Date;
            maxUses?: number;
            campaign?: string;
        } = {
            code,
        };

        // Parse expiresAt
        if (expiresAtStr) {
            const date = new Date(expiresAtStr);
            if (!isNaN(date.getTime())) {
                result.expiresAt = date;
            }
        }

        // Parse maxUses (default to 1 if not provided or invalid)
        if (maxUsesStr) {
            const maxUses = parseInt(maxUsesStr, 10);
            if (!isNaN(maxUses) && maxUses > 0) {
                result.maxUses = maxUses;
            }
        }

        // Parse campaign
        if (campaign) {
            result.campaign = campaign;
        }

        results.push(result);
    }

    return results;
}

/**
 * Import promo codes from CSV
 */
export async function importPromoCodes(
    codes: {
        code: string;
        expiresAt?: Date;
        maxUses?: number;
        campaign?: string;
    }[],
    batchId: string,
    adminId: string,
    defaultCampaign?: string,
): Promise<{
    imported: number;
    duplicates: number;
    expired: number;
    warnings: string[];
}> {
    let imported = 0;
    let duplicates = 0;
    let expired = 0;
    const warnings: string[] = [];

    for (const item of codes) {
        const codeHash = crypto
            .createHash("sha256")
            .update(item.code)
            .digest("hex");
        const encryptedCode = encryptCode(item.code);

        // Check if code is already expired
        const isExpired =
            item.expiresAt && item.expiresAt.getTime() < Date.now();
        if (isExpired) {
            expired++;
            warnings.push(
                `Code "${item.code.substring(0, 8)}..." is already expired`,
            );
        }

        try {
            await prisma.promoCodes.create({
                data: {
                    codeHash,
                    encryptedCode,
                    expiresAt: item.expiresAt,
                    maxUses: item.maxUses || 1,
                    usedCount: 0,
                    campaign: item.campaign || defaultCampaign,
                    isActive: true,
                    batchId,
                    status: isExpired
                        ? CodeStatus.EXPIRED
                        : CodeStatus.AVAILABLE,
                },
            });
            imported++;
        } catch (error) {
            duplicates++;
        }
    }

    await prisma.auditLog.create({
        data: {
            action: "csv_upload",
            userId: adminId,
            metadata: {
                batchId,
                imported,
                duplicates,
                expired,
                campaign: defaultCampaign,
            },
        },
    });

    return { imported, duplicates, expired, warnings };
}

/**
 * Allocate an available promo code
 */
export async function allocatePromoCode(
    walletAddress: string,
    txHash: string,
    burnAmount: string,
    campaign?: string,
): Promise<{ success: boolean; code?: string; error?: string }> {
    return await prisma.$transaction(async (tx) => {
        // Find an available code
        const whereClause: any = {
            status: CodeStatus.AVAILABLE,
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        };

        // Filter by campaign if specified
        if (campaign) {
            whereClause.campaign = campaign;
        }

        const code = await tx.promoCodes.findFirst({
            where: whereClause,
        });

        if (!code) {
            return {
                success: false,
                error: campaign
                    ? `No promo codes available for campaign "${campaign}"`
                    : "No promo codes available",
            };
        }

        // Check if code has reached max uses
        if (code.usedCount >= code.maxUses) {
            // This shouldn't happen if status is AVAILABLE, but check anyway
            return { success: false, error: "Code has reached maximum uses" };
        }

        // Increment usage count
        const newUsedCount = code.usedCount + 1;
        const isFullyUsed = newUsedCount >= code.maxUses;

        // Update code status
        await tx.promoCodes.update({
            where: { id: code.id },
            data: {
                usedCount: newUsedCount,
                status: isFullyUsed
                    ? CodeStatus.REDEEMED
                    : CodeStatus.AVAILABLE,
            },
        });

        // Create redemption record
        await tx.redemptions.create({
            data: {
                walletAddress: walletAddress.toLowerCase(),
                txHash: txHash.toLowerCase(),
                burnAmount,
                promoCodeId: code.id,
            },
        });

        // Audit log
        await tx.auditLog.create({
            data: {
                action: "redemption",
                userId: walletAddress.toLowerCase(),
                metadata: {
                    txHash,
                    promoCodeId: code.id,
                    campaign: code.campaign,
                    usedCount: newUsedCount,
                    maxUses: code.maxUses,
                },
            },
        });

        // Decrypt to show to user
        const decryptedCode = decryptCode(code.encryptedCode);

        return { success: true, code: decryptedCode };
    });
}
