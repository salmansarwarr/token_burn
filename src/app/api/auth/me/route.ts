import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
    try {
        const session = await getSession();

        return NextResponse.json({
            address: session.address || null,
            adminId: session.adminId || null,
            isAuthenticated: !!session.address,
            isAdmin: !!session.adminId,
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { error: "Failed to fetch session" },
            { status: 500 },
        );
    }
}
