import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Registration from "@/models/Registration";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getCurrentUser(req);

        if (!session) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (session.role !== "manager" && session.role !== "admin") {
            return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        // 1. Get all tournaments created by this manager
        const tournaments = await Tournament.find({ createdBy: session._id })
            .sort({ createdAt: -1 })
            .lean();

        const tournamentIds = tournaments.map((t) => t._id);

        // 2. Aggregate stats
        let totalViews = 0;
        let activeTournaments = 0;
        const statusBreakdown: Record<string, number> = {
            draft: 0,
            registration: 0,
            ongoing: 0,
            completed: 0,
            cancelled: 0,
        };

        tournaments.forEach((t) => {
            totalViews += t.views || 0;
            if (t.status === "ongoing" || t.status === "registration") {
                activeTournaments++;
            }
            if (statusBreakdown[t.status] !== undefined) {
                statusBreakdown[t.status]++;
            }
        });

        // 3. Registrations (total teams)
        const totalTeams = await Registration.countDocuments({ tournament: { $in: tournamentIds }, status: "active" });
        const pendingRegistrations = await Registration.countDocuments({ tournament: { $in: tournamentIds }, status: "withdrawn" });

        // Build overview
        const overview = {
            totalTournaments: tournaments.length,
            activeTournaments,
            totalTeams,
            totalViews,
            pendingRegistrations,
            totalMatches: 0, // Mock for now until Match model is integrated fully
            completedMatches: 0,
            liveMatches: 0,
        };

        return Response.json({
            success: true,
            data: {
                overview,
                statusBreakdown,
                recentTournaments: tournaments.slice(0, 5),
            },
        });
    } catch (error: any) {
        console.error("Manager dashboard error:", error);
        return Response.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
