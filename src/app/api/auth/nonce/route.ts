import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generateNonce } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        const nonce = generateNonce();

        session.nonce = nonce;
        await session.save();

        return NextResponse.json({ nonce });
    } catch (error) {
        console.error("Error generating nonce:", error);
        return NextResponse.json(
            { error: "Failed to generate nonce" },
            { status: 500 },
        );
    }
}
