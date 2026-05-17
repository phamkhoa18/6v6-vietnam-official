import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

/**
 * GET /api/users/search-public?q=...
 * Public endpoint for searching users by playerId or name.
 * Returns limited fields only (no phone/email for privacy).
 * Used by registration forms to link teammates in 2v2/3v3.
 */
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.trim().length < 1) {
            return NextResponse.json({ success: true, data: [] });
        }

        const orConditions: any[] = [];

        // If numeric, search by playerId
        const numQuery = parseInt(query);
        if (!isNaN(numQuery)) {
            orConditions.push({ playerId: numQuery });
        }

        // Always search by name/nickname (case-insensitive)
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
        orConditions.push({ name: regex });
        orConditions.push({ nickname: regex });

        const users = await User.find({ $or: orConditions, isActive: true })
            .select("name avatar playerId nickname teamName")
            .limit(8)
            .lean();

        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
