import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Team from "@/models/Team";

// GET /api/tournaments/[id]/teams — List teams for a tournament (with pagination & search)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const { searchParams } = new URL(req.url);

        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));
        const search = searchParams.get("search") || "";

        // Build query filter
        const filter: any = { tournament: id };
        if (search.trim()) {
            filter.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { shortName: { $regex: search.trim(), $options: "i" } },
            ];
        }

        const total = await Team.countDocuments(filter);
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const teams = await Team.find(filter)
            .populate("captain", "name avatar nickname")
            .populate("members.user", "name avatar nickname")
            .sort("-registeredAt")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                teams,
                pagination: { page, limit, total, totalPages },
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
