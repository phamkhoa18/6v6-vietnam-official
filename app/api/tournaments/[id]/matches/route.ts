import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Match from "@/models/Match";
import { getCurrentUser } from "@/lib/auth";

// POST /api/tournaments/[id]/matches — Create a match
export async function POST(
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

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ success: false, message: "Không tìm thấy giải đấu" }, { status: 404 });
        }

        const body = await req.json();
        const match = await Match.create({
            tournament: id,
            round: body.round || 1,
            matchNumber: body.matchNumber || 1,
            group: body.group || undefined,
            teamA: body.teamA || undefined,
            teamB: body.teamB || undefined,
            playerA: body.playerA || undefined,
            playerB: body.playerB || undefined,
            scheduledAt: body.scheduledAt || undefined,
            notes: body.notes || "",
            status: "scheduled",
        });

        return NextResponse.json({ success: true, data: { match } }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}

// GET /api/tournaments/[id]/matches — List matches for a tournament
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const matches = await Match.find({ tournament: id })
            .populate("teamA", "name shortName logo")
            .populate("teamB", "name shortName logo")
            .populate("playerA", "name avatar nickname playerId")
            .populate("playerB", "name avatar nickname playerId")
            .sort("round matchNumber")
            .lean();

        return NextResponse.json({ success: true, data: { matches } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
