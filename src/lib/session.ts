import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
    address?: string;
    nonce?: string;
    adminId?: string;
}

const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET!,
    cookieName: "armchair_session",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};

export async function getSession(): Promise<IronSession<SessionData>> {
    return getIronSession<SessionData>(cookies(), sessionOptions);
}
