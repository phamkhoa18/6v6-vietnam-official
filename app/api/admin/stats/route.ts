import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Tournament from "@/models/Tournament";
import Registration from "@/models/Registration";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getCurrentUser(req);

        if (!session || session.role !== "admin") {
            return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        // 1. Users
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const roles = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        const roleBreakdown = roles.reduce((acc, curr) => ({ ...acc, [curr._id || "user"]: curr.count }), {});

        // 2. Tournaments
        const totalTournaments = await Tournament.countDocuments();
        const statuses = await Tournament.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const statusBreakdown = statuses.reduce((acc, curr) => ({ ...acc, [curr._id || "draft"]: curr.count }), {});

        // 3. Teams (Registrations)
        const totalTeams = await Registration.countDocuments({ status: "active" });

        return Response.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    verified: verifiedUsers,
                    roles: roleBreakdown
                },
                tournaments: {
                    total: totalTournaments,
                    statusBreakdown
                },
                teams: {
                    total: totalTeams
                },
                matches: {
                    total: 0 // Mock for now
                }
            },
        });
    } catch (error: any) {
        console.error("Admin stats error:", error);
        return Response.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
