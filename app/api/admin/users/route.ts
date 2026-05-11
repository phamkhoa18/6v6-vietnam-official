import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getCurrentUser(req);

        if (!session || session.role !== "admin") {
            return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const page = parseInt(searchParams.get("page") || "1", 10);

        const query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { playerId: { $regex: search, $options: "i" } }
            ];
        }
        if (role && role !== "all") {
            query.role = role;
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return Response.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error: any) {
        console.error("Get users error:", error);
        return Response.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
