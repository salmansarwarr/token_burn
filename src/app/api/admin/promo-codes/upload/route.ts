import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { importPromoCodes, parseCSV } from "@/lib/promo-codes";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session.adminId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 },
            );
        }

        const content = await file.text();
        const codes = parseCSV(content);

        if (codes.length === 0) {
            return NextResponse.json(
                { error: "No valid codes found in CSV" },
                { status: 400 },
            );
        }

        const batchId = uuidv4();
        const result = await importPromoCodes(codes, batchId, session.adminId);

        return NextResponse.json({
            success: true,
            imported: result.imported,
            duplicates: result.duplicates,
            batchId,
        });
    } catch (error: any) {
        console.error("Error uploading CSV:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
