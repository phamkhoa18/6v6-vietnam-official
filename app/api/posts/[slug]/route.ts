import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";

// GET /api/posts/[slug]
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await dbConnect();
        const { slug } = await params;

        const post = await Post.findOne({ slug, status: "published" })
            .populate("author", "name avatar")
            .lean();

        if (!post) {
            return NextResponse.json(
                { success: false, message: "Bài viết không tồn tại" },
                { status: 404 }
            );
        }

        // Increment views
        await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

        // Get related posts
        const related = await Post.find({
            status: "published",
            _id: { $ne: post._id },
            $or: [
                { category: (post as any).category },
                { tags: { $in: (post as any).tags || [] } },
            ],
        })
            .sort({ publishedAt: -1 })
            .limit(6)
            .select("title slug coverImage category publishedAt views")
            .populate("author", "name")
            .lean();

        return NextResponse.json({
            success: true,
            data: { post, related },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
