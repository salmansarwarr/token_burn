import bcrypt from "bcrypt";
import { getSession } from "./session";
import { prisma } from "./prisma";
import crypto from "crypto";

/**
 * Generate a cryptographically secure random nonce
 */
export function generateNonce(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Verify admin session and return admin user
 */
export async function verifyAdmin() {
    const session = await getSession();

    if (!session.adminId) {
        return null;
    }

    const admin = await prisma.adminUsers.findUnique({
        where: { id: session.adminId },
    });

    return admin;
}

/**
 * Simple CSRF token generation and validation
 * Stores token in session and validates on mutation requests
 */
export async function generateCsrfToken(): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    const session = await getSession();
    (session as any).csrfToken = token;
    await session.save();
    return token;
}

export async function validateCsrfToken(token: string): Promise<boolean> {
    const session = await getSession();
    const sessionToken = (session as any).csrfToken;
    return sessionToken === token;
}
