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
 */
export function parseCSV(fileContent: string): {
    code: string;
    expiresAt?: Date;
}[] {
    const lines = fileContent.split(/\r?\n/);
    const results: { code: string; expiresAt?: Date }[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("code")) continue;

        const [code, expiresAtStr] = trimmed.split(",");

        if (!code) continue;

        const result: { code: string; expiresAt?: Date } = {
            code: code.trim(),
        };

        if (expiresAtStr) {
            const date = new Date(expiresAtStr.trim());
            if (!isNaN(date.getTime())) {
                result.expiresAt = date;
            }
        }

        results.push(result);
    }

    return results;
}

/**
 * Import promo codes from CSV
 */
export async function importPromoCodes(
    codes: { code: string; expiresAt?: Date }[],
    batchId: string,
    adminId: string,
): Promise<{ imported: number; duplicates: number }> {
    let imported = 0;
    let duplicates = 0;

    for (const item of codes) {
        // We store encrypted version.
        // To prevent duplicates, we might want a hash column too?
        // Or just rely on application logic?
        // Let's use the codeHash column for uniqueness checks (SHA256)
        // and store the encrypted code in a new column?
        // Wait, schema has `codeHash`. I can use that for uniqueness and store encrypted value in a new field?
        // Or just store encrypted value in `codeHash`? No, encrypted value is random (IV).
        // So we need: `codeHash` (SHA256, unique index) AND `encryptedCode` (AES-256).

        // I need to update schema to add `encryptedCode`.

        const codeHash = crypto
            .createHash("sha256")
            .update(item.code)
            .digest("hex");
        const encryptedCode = encryptCode(item.code);

        try {
            await prisma.promoCodes.create({
                data: {
                    codeHash,
                    encryptedCode, // Need to add this to schema
                    expiresAt: item.expiresAt,
                    batchId,
                    status: CodeStatus.AVAILABLE,
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
            },
        },
    });

    return { imported, duplicates };
}

/**
 * Allocate an available promo code
 */
export async function allocatePromoCode(
    walletAddress: string,
    txHash: string,
    burnAmount: string,
): Promise<{ success: boolean; code?: string; error?: string }> {
    return await prisma.$transaction(async (tx) => {
        const code = await tx.promoCodes.findFirst({
            where: {
                status: CodeStatus.AVAILABLE,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
        });

        if (!code) {
            return { success: false, error: "No promo codes available" };
        }

        await tx.promoCodes.update({
            where: { id: code.id },
            data: { status: CodeStatus.ALLOCATED },
        });

        await tx.redemptions.create({
            data: {
                walletAddress: walletAddress.toLowerCase(),
                txHash: txHash.toLowerCase(),
                burnAmount,
                promoCodeId: code.id,
            },
        });

        await tx.auditLog.create({
            data: {
                action: "redemption",
                userId: walletAddress.toLowerCase(),
                metadata: {
                    txHash,
                    promoCodeId: code.id,
                },
            },
        });

        // Decrypt to show to user
        const decryptedCode = decryptCode(code.encryptedCode);

        return { success: true, code: decryptedCode };
    });
}
