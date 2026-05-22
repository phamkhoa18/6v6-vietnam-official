import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Match from "@/models/Match";
import Team from "@/models/Team";
import { getCurrentUser } from "@/lib/auth";

/**
 * PUT /api/tournaments/[id]/brackets/swap
 * Swap two teams' positions in the bracket (Round 1 only).
 * Body: { team1Id, team2Id }
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const { team1Id, team2Id } = await req.json();
        if (!team1Id || !team2Id) {
            return NextResponse.json({ success: false, message: "Thiếu team1Id hoặc team2Id" }, { status: 400 });
        }

        // Find matches containing these teams in round 1
        const round1Matches = await Match.find({
            tournament: id,
            round: 1,
        });

        let match1: any = null, side1 = "";
        let match2: any = null, side2 = "";

        for (const m of round1Matches) {
            if (m.teamA?.toString() === team1Id) { match1 = m; side1 = "teamA"; }
            if (m.teamB?.toString() === team1Id) { match1 = m; side1 = "teamB"; }
            if (m.teamA?.toString() === team2Id) { match2 = m; side2 = "teamA"; }
            if (m.teamB?.toString() === team2Id) { match2 = m; side2 = "teamB"; }
        }

        if (!match1 || !match2) {
            return NextResponse.json({ success: false, message: "Không tìm thấy đội trong vòng 1" }, { status: 400 });
        }

        // Swap team references
        const temp = (match1 as any)[side1];
        (match1 as any)[side1] = (match2 as any)[side2];
        (match2 as any)[side2] = temp;

        // Re-evaluate walkover/bye status after swap
        const reevaluate = (m: any) => {
            if (m.status === "completed" && m.resultType !== "walkover") return; // Don't touch completed real matches
            
            const hasA = !!m.teamA;
            const hasB = !!m.teamB;

            if (hasA && hasB) {
                // Both teams present — normal match
                if (m.status === "walkover" || m.status === "bye") {
                    m.status = "scheduled";
                    m.winner = null;
                    m.resultType = "regular";
                    m.scoreA = 0;
                    m.scoreB = 0;
                }
            } else if (hasA || hasB) {
                // Only one team — walkover
                m.status = "completed";
                m.resultType = "walkover";
                m.winner = hasA ? "A" : "B";
                m.scoreA = 0;
                m.scoreB = 0;
            } else {
                // No teams — bye
                m.status = "scheduled";
                m.winner = null;
            }
        };

        reevaluate(match1);
        reevaluate(match2);

        await match1.save();
        await match2.save();

        return NextResponse.json({
            success: true,
            message: "Đã đổi vị trí thành công",
            data: { match1: match1._id, match2: match2._id },
        });
    } catch (error: any) {
        console.error("Swap error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
