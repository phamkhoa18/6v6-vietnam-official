import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";

// GET /api/posts/tags — Get all unique tags with counts
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const result = await Post.aggregate([
            { $match: { status: "published" } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
        ]);

        const tags = result.map((t: any) => ({ name: t._id, count: t.count }));

        return NextResponse.json({ success: true, data: { tags } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
