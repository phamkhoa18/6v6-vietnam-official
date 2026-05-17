import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        
        // Require admin or manager privileges
        const currentUser = await getCurrentUser(req);
        if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.trim() === "") {
            return NextResponse.json({ success: true, data: [] });
        }

        // Search by phone, name (case-insensitive) or exact numeric playerId
        const regex = new RegExp(query, "i");
        const orConditions: any[] = [
            { name: regex },
            { phone: regex },
            { nickname: regex },
            { email: regex }
        ];
        
        const numQuery = parseInt(query);
        if (!isNaN(numQuery)) {
            orConditions.push({ playerId: numQuery });
        }

        const users = await User.find({ $or: orConditions })
        .select("name avatar phone playerId nickname email")
        .limit(10)
        .lean();

        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
