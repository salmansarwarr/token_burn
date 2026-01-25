import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { SiweMessage } from "siwe";

export async function POST(request: NextRequest) {
    try {
        const { message, signature } = await request.json();

        if (!message || !signature) {
            return NextResponse.json(
                { error: "Message and signature required" },
                { status: 400 },
            );
        }

        const session = await getSession();
        const siweMessage = new SiweMessage(message);

        // Verify the signature
        const fields = await siweMessage.verify({ signature });

        // Validate nonce matches session
        if (fields.data.nonce !== session.nonce) {
            return NextResponse.json(
                { error: "Invalid nonce" },
                { status: 401 },
            );
        }

        // Validate domain
        const domain = new URL(
            process.env.NEXTAUTH_URL || "http://localhost:3000",
        ).host;
        if (fields.data.domain !== domain) {
            return NextResponse.json(
                { error: "Invalid domain" },
                { status: 401 },
            );
        }

        // Check expiration
        if (
            fields.data.expirationTime &&
            new Date(fields.data.expirationTime) < new Date()
        ) {
            return NextResponse.json(
                { error: "Message expired" },
                { status: 401 },
            );
        }

        // Clear nonce (single use)
        session.nonce = undefined;

        // Store authenticated address
        session.address = fields.data.address;
        await session.save();

        return NextResponse.json({
            success: true,
            address: fields.data.address,
        });
    } catch (error) {
        console.error("Error verifying SIWE message:", error);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 401 },
        );
    }
}
