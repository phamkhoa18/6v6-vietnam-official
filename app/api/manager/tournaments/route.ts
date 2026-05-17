import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { getCurrentUser } from "@/lib/auth";

// GET /api/manager/tournaments — List all tournaments created by the current manager
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json(
                { success: false, message: "Không có quyền truy cập" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const status = searchParams.get("status");
        const sort = searchParams.get("sort") || "-createdAt";

        const query: any = { createdBy: user._id };

        // Admin can see all tournaments
        if (user.role === "admin") {
            delete query.createdBy;
        }

        if (status && status !== "all") {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const [tournaments, total] = await Promise.all([
            Tournament.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate("createdBy", "name avatar")
                .lean(),
            Tournament.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                tournaments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error: any) {
        console.error("Manager tournaments error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
