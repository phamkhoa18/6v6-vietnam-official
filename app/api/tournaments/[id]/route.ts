import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import Registration from "@/models/Registration";
import Match from "@/models/Match";
import { getCurrentUser } from "@/lib/auth";

// GET /api/tournaments/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const tournament = await Tournament.findById(id)
            .populate("createdBy", "name avatar")
            .lean();

        if (!tournament) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy giải đấu" },
                { status: 404 }
            );
        }

        // Increment views
        await Tournament.findByIdAndUpdate(id, { $inc: { views: 1 } });

        // Get participants based on gameMode
        let participants: any[] = [];
        if (tournament.gameMode === "1v1") {
            participants = await Registration.find({ tournament: id })
                .populate("user", "name avatar nickname playerId province")
                .sort("seed registeredAt")
                .lean();
        } else {
            participants = await Team.find({ tournament: id })
                .populate("captain", "name avatar nickname")
                .populate("members.user", "name avatar nickname playerId")
                .sort("seed registeredAt")
                .lean();
        }

        // Get matches
        const matches = await Match.find({ tournament: id })
            .populate("teamA", "name shortName logo")
            .populate("teamB", "name shortName logo")
            .populate("playerA", "name avatar nickname playerId")
            .populate("playerB", "name avatar nickname playerId")
            .sort("round matchNumber")
            .lean();

        return NextResponse.json({
            success: true,
            data: { tournament, participants, matches },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/tournaments/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json(
                { success: false, message: "Không có quyền cập nhật" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const tournament = await Tournament.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!tournament) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy giải đấu" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { tournament },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        );
    }
}
