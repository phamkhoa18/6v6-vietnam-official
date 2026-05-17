import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";

// GET /api/posts — List posts
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const category = searchParams.get("category");
        const tag = searchParams.get("tag");
        const search = searchParams.get("search") || "";
        const featured = searchParams.get("featured");

        const query: any = { status: "published" };
        if (category) query.category = category;
        if (tag) query.tags = tag;
        if (featured === "true") query.isFeatured = true;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { excerpt: { $regex: search, $options: "i" } },
                { tags: { $in: [new RegExp(search, "i")] } },
            ];
        }

        const skip = (page - 1) * limit;
        const [posts, total, pinned] = await Promise.all([
            Post.find(query)
                .sort({ isPinned: -1, publishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("author", "name avatar")
                .lean(),
            Post.countDocuments(query),
            page === 1
                ? Post.find({ status: "published", isPinned: true })
                      .sort({ publishedAt: -1 })
                      .limit(3)
                      .populate("author", "name avatar")
                      .lean()
                : [],
        ]);

        return NextResponse.json({
            success: true,
            data: {
                posts,
                pinned,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
