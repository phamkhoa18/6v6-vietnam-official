import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/tournaments/[id]/audit
 * Returns audit/history log for match changes.
 * Currently returns empty array since audit logging is not yet implemented.
 * This prevents 404 errors in the UI.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const matchId = searchParams.get("matchId");
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        // Return empty audit log for now — UI will show "Chưa có lịch sử"
        return NextResponse.json({
            success: true,
            data: {
                logs: [],
                total: 0,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
