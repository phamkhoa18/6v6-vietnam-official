import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { getCurrentUser } from "@/lib/auth";

// GET /api/tournaments — List tournaments
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const status = searchParams.get("status");
        const gameMode = searchParams.get("gameMode");
        const search = searchParams.get("search") || "";
        const sort = searchParams.get("sort") || "-createdAt";

        const query: any = { isPublic: true };
        if (status && status !== "all") query.status = status;
        if (gameMode && gameMode !== "all") query.gameMode = gameMode;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { tags: { $in: [new RegExp(search, "i")] } },
            ];
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
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/tournaments — Create tournament
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json(
                { success: false, message: "Không có quyền tạo giải đấu" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const tournament = await Tournament.create({
            ...body,
            createdBy: user._id,
        });

        return NextResponse.json(
            { success: true, data: { tournament } },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        );
    }
}
