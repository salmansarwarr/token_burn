import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
    try {
        const session = await getSession();
        session.adminId = undefined;
        await session.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error logging out admin:", error);
        return NextResponse.json(
            { error: "Failed to logout" },
            { status: 500 },
        );
    }
}
