import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400 },
            );
        }

        // Find admin user
        const admin = await prisma.adminUsers.findUnique({
            where: { email },
        });

        if (!admin) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 },
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, admin.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 },
            );
        }

        // Create admin session
        const session = await getSession();
        session.adminId = admin.id;
        await session.save();

        return NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error("Error logging in admin:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
